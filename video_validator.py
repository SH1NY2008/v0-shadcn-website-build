
import re
import subprocess
import json

def is_video_valid(video_id: str) -> bool:
    """
    Checks if a YouTube video is valid and embeddable using the oEmbed endpoint.
    """
    command = f"curl -s -o /dev/null -w '%{{http_code}}' 'https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v={video_id}'"
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        return result.stdout.strip() == "200"
    except subprocess.TimeoutExpired:
        print(f"  -> Timeout checking videoId: {video_id}")
        return False

def find_invalid_videos():
    """
    Parses the curriculum file, checks each video's validity, and writes the invalid
    ones to a JSON file.
    """
    file_path = "lib/curriculum.ts"
    print(f"Reading curriculum from: {file_path}")
    with open(file_path, 'r') as f:
        content = f.read()

    # Regex to find all topics with their name and videoId
    topic_pattern = re.compile(r'{\s*name:\s*"(?P<name>[^"]+)",\s*videoId:\s*"(?P<videoId>[^"]+)"\s*}')
    
    all_topics = topic_pattern.finditer(content)
    invalid_videos = []

    print("Starting validation of all videos...")
    for match in all_topics:
        topic = match.groupdict()
        name = topic['name']
        video_id = topic['videoId']
        
        print(f"Checking: {name} ({video_id})")
        if not is_video_valid(video_id):
            print(f"  -> INVALID video found: {name} ({video_id})")
            invalid_videos.append(topic)
        else:
            print(f"  -> Valid")

    output_file = 'invalid_videos.json'
    print(f"Found {len(invalid_videos)} invalid videos. Writing them to {output_file}")
    with open(output_file, 'w') as f:
        json.dump(invalid_videos, f, indent=2)

if __name__ == "__main__":
    find_invalid_videos()
