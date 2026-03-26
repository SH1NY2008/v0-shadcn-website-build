import os
import re
import json
import ollama
import time

def parse_ap_courses_ts(file_path):
    """
    Parses the ap-courses.ts file to extract course names and topics.
    """
    with open(file_path, 'r') as f:
        content = f.read()

    courses = []
    course_objects = re.findall(r'{\s*name: "([^"]+)",\s*topics: \[(.*?)\]\s*}', content, re.DOTALL)

    for course_name, topics_str in course_objects:
        topics = re.findall(r'{ name: "([^"]+)"', topics_str)
        if course_name and topics:
            courses.append({
                "name": course_name,
                "topics": topics
            })

    return courses

def generate_questions(course_name, topic, retries=3, delay=5):
    """
    Generates questions for a given course and topic using the Ollama API with retry logic.
    """
    prompt = f"""Generate 5 multiple choice questions for the AP course "{course_name}" on the topic of "{topic}".
Please provide the output in a valid JSON format as an array of objects. Each object should have the following keys: "question", "choices", "answer", and "explanation".
The "choices" should be an array of 4 strings.
The "answer" should be one of the strings from the "choices" array.
The "explanation" should be a brief explanation of why the answer is correct.

Example format:
[
  {{
    "question": "This is the first question.",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "answer": "Choice A",
    "explanation": "This is the explanation for the first question."
  }},
  {{
    "question": "This is the second question.",
    "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
    "answer": "Choice 2",
    "explanation": "This is the explanation for the second question."
  }}
]
"""

    for attempt in range(retries):
        try:
            response = ollama.chat(
                model='llama2',
                messages=[
                    {'role': 'user', 'content': prompt}
                ]
            )
            response_text = response['message']['content']
            
            # Clean the response text to remove markdown and other non-JSON artifacts
            response_text = re.sub(r'```json', '', response_text)
            response_text = re.sub(r'```', '', response_text)
            response_text = response_text.strip()

            # Attempt to parse the entire response as JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # If parsing the whole string fails, try to find a JSON array within it
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group(0))
                    except json.JSONDecodeError as e:
                        print(f"Warning: Could not parse extracted JSON for {course_name} - {topic}. Error: {e}")
                        continue # Move to the next retry
                else:
                    print(f"Warning: No JSON array found in response for {course_name} - {topic}. Response was: {response_text}")
                    continue # Move to the next retry

        except Exception as e:
            print(f"An error occurred while calling the Ollama API for {course_name} - {topic}: {e}")
        
        print(f"Retrying... ({attempt + 1}/{retries})")
        time.sleep(delay)

    print(f"Failed to generate questions for {course_name} - {topic} after {retries} attempts.")
    return None

def main():
    """
    Main function to generate questions for all AP courses and topics.
    """
    ap_courses_file = 'lib/ap-courses.ts'
    courses = parse_ap_courses_ts(ap_courses_file)

    if not courses:
        print("No courses found. Exiting.")
        return

    all_questions = {}
    
    print(f"Found {len(courses)} courses.")

    for course in courses:
        course_name = course['name']
        all_questions[course_name] = {}
        print(f"Generating questions for {course_name}...")
        for topic in course['topics']:
            print(f"  - Topic: {topic}")
            questions = generate_questions(course_name, topic)
            if questions:
                all_questions[course_name][topic] = questions
    
    output_file = 'app/data/generated_mcqs.json'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(all_questions, f, indent=2)

    print(f"Successfully generated and saved questions to {output_file}")


if __name__ == "__main__":
    main()
