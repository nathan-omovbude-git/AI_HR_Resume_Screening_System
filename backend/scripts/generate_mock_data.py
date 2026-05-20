import os
import random
import pandas as pd


def generate_data(n=100):
    data = {
        'Experience_Years': [random.randint(0, 15) for _ in range(n)],
        'Skill_Match_Score': [random.randint(20, 100) for _ in range(n)],
        'Education_Level_Score': [random.choice([1, 2, 3, 4]) for _ in range(n)],  # 1:Dip, 2:BSc, 3:MSc, 4:PhD
        'Project_Count': [random.randint(1, 10) for _ in range(n)],
        'Shortlisted': []
    }
    
    # Simple logic to determine if "Shortlisted" (1 or 0)
    for i in range(n):
        if data['Experience_Years'][i] > 5 and data['Skill_Match_Score'][i] > 70:
            data['Shortlisted'].append(1)
        elif data['Education_Level_Score'][i] >= 3 and data['Project_Count'][i] > 5:
            data['Shortlisted'].append(1)
        else:
            data['Shortlisted'].append(0 if random.random() > 0.2 else 1)  # Add some noise
            
    df = pd.DataFrame(data)
    
    # 1. Dynamically locate the true project root folder
    script_dir = os.path.dirname(os.path.abspath(__file__))  # Points to 'scripts'
    project_root = os.path.abspath(os.path.join(script_dir, os.pardir))  # Points to 'AI_HR_Resume_Screening'
    
    # 2. Establish the absolute target directory and file paths
    target_dir = os.path.join(project_root, 'data', 'raw')
    data_path = os.path.join(target_dir, 'ai_hiring_data.csv')
    
    # 3. Create the folders at the absolute root level if they don't exist
    os.makedirs(target_dir, exist_ok=True)
    
    # 4. Save the file dynamically
    df.to_csv(data_path, index=False)
    print(f"Mock data successfully generated at: {data_path}")

generate_data(200)
