import os
import re
import json

topic_categories = {
    "Limits & Continuity": [],
    "Differentiation": [],
    "Application of Differentiation": [],
    "Integration": [],
    "Application of Integration": [],
    "Differential Equations": [],
    "Parametric, Polar & Vector Functions": [],
    "Infinite Sequences and Series": [],

}

problems_dir = './problems'

for filename in os.listdir(problems_dir):
    if filename.startswith('prob') and filename.endswith('.html'):
        with open(os.path.join(problems_dir, filename), 'r', encoding='utf-8') as file:
            content = file.read()
            
        problem_number = int(re.search(r'\d+', filename).group())
        
        match = re.search(r'<div class="question" data-tag="([^"]+)"', content)
        if match and match.group(1) in topic_categories:
            topic_categories[match.group(1)].append(problem_number)

# Sort the problem numbers in each category
for category in topic_categories:
    topic_categories[category].sort()

# Save the result to a JSON file
with open('prob_categories.json', 'w', encoding='utf-8') as outfile:
    json.dump(topic_categories, outfile, indent=2)

print("prob_categories have been saved to topic_categories.json")