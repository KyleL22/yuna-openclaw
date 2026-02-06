import os

constitution_path = "/Users/openclaw-kong/workspace/yuna-openclaw/docs/core/legal/CONSTITUTION.md"

leadership_principles = [
    "Wow the Customer", "Ruthless Prioritization", "Velocity is a Proactive Choice",
    "Dive Deep", "Ownership", "Deliver Results with Grit", "Bias for Action",
    "Build Better Systems", "Simplify", "Hire and Develop the Best",
    "Disagree and Commit", "Be Open and Courageous", "Spend Wisely",
    "Think Big", "Integrity"
]

def check_integrity():
    if not os.path.exists(constitution_path):
        print("FAIL: CONSTITUTION.md not found.")
        return False
    
    with open(constitution_path, 'r') as f:
        content = f.read()
    
    missing = []
    for lp in leadership_principles:
        if lp not in content:
            missing.append(lp)
    
    if missing:
        print(f"FAIL: Missing Leadership Principles: {', '.join(missing)}")
        return False
    
    print("PASS: Constitutional Integrity Verified.")
    return True

if __name__ == "__main__":
    check_integrity()
