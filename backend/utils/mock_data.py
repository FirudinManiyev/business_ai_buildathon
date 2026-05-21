PRODUCTS = {
    "laptop_pro_14": {
        "id": 1,
        "name": "Laptop Pro 14",
        "category": "Electronics",
        "description": "Lightweight business laptop with 14-inch display and 16GB RAM.",
        "cost_price": 980,
        "sell_price": 1290,
        "stock": 18,
    },
    "office_mouse": {
        "id": 2,
        "name": "Office Mouse",
        "category": "Accessories",
        "description": "Wireless ergonomic mouse for daily productivity.",
        "cost_price": 12,
        "sell_price": 24,
        "stock": 120,
    },
    "smart_monitor_27": {
        "id": 3,
        "name": "Smart Monitor 27",
        "category": "Electronics",
        "description": "27-inch IPS monitor with USB-C and built-in speakers.",
        "cost_price": 165,
        "sell_price": 245,
        "stock": 34,
    },
    "wireless_keyboard": {
        "id": 4,
        "name": "Wireless Keyboard",
        "category": "Accessories",
        "description": "Slim wireless keyboard with silent keys.",
        "cost_price": 18,
        "sell_price": 39,
        "stock": 90,
    },
    "cloud_backup_1tb": {
        "id": 5,
        "name": "Cloud Backup 1TB",
        "category": "Services",
        "description": "One year cloud backup plan for small teams.",
        "cost_price": 28,
        "sell_price": 69,
        "stock": 300,
    },
    "desk_lamp_led": {
        "id": 6,
        "name": "Desk Lamp LED",
        "category": "Office",
        "description": "Adjustable LED desk lamp with warm and cool modes.",
        "cost_price": 9,
        "sell_price": 21,
        "stock": 140,
    },
    "noise_cancel_headset": {
        "id": 7,
        "name": "Noise Cancel Headset",
        "category": "Electronics",
        "description": "Headset for remote meetings and call centers.",
        "cost_price": 64,
        "sell_price": 129,
        "stock": 56,
    },
    "projector_hd": {
        "id": 8,
        "name": "Projector HD",
        "category": "Electronics",
        "description": "Portable HD projector for presentations and demos.",
        "cost_price": 210,
        "sell_price": 349,
        "stock": 22,
    },
}

JOB_LISTINGS = {
    "sales_manager": {
        "id": 1,
        "title": "Sales Manager",
        "company_name": "Buildathon Mart",
        "required_skills": ["B2B sales", "CRM", "negotiation"],
        "min_experience": 3,
        "max_experience": 6,
        "experience_years": "3+",
        "salary_min": 1800,
        "salary_max": 3200,
        "location": "Remote",
    },
    "data_analyst": {
        "id": 2,
        "title": "Data Analyst",
        "company_name": "Buildathon Insights",
        "required_skills": ["SQL", "Excel", "dashboarding"],
        "min_experience": 2,
        "max_experience": 5,
        "experience_years": "2+",
        "salary_min": 1500,
        "salary_max": 2600,
        "location": "Baku",
    },
    "python_engineer": {
        "id": 3,
        "title": "Python Engineer",
        "company_name": "AI Commerce Lab",
        "required_skills": ["Python", "FastAPI", "SQLAlchemy"],
        "min_experience": 4,
        "max_experience": 7,
        "experience_years": "4+",
        "salary_min": 2200,
        "salary_max": 3800,
        "location": "Hybrid",
    },
    "hr_generalist": {
        "id": 4,
        "title": "HR Generalist",
        "company_name": "PeopleOps Studio",
        "required_skills": ["recruitment", "interviews", "onboarding"],
        "min_experience": 3,
        "max_experience": 6,
        "experience_years": "3+",
        "salary_min": 1600,
        "salary_max": 2900,
        "location": "Hybrid",
    },
    "finance_analyst": {
        "id": 5,
        "title": "Finance Analyst",
        "company_name": "LedgerFlow",
        "required_skills": ["budgeting", "forecasting", "excel"],
        "min_experience": 2,
        "max_experience": 5,
        "experience_years": "2+",
        "salary_min": 1700,
        "salary_max": 3100,
        "location": "Remote",
    },
}

WORKERS = {
    "worker_amina": {
        "id": 1,
        "full_name": "Amina Aliyeva",
        "role": "Sales Specialist",
        "skills": ["lead qualification", "CRM", "proposal writing"],
        "performance_score": 91,
        "salary": 1800,
    },
    "worker_eli": {
        "id": 2,
        "full_name": "Eli Karimov",
        "role": "Operations Associate",
        "skills": ["inventory", "order tracking", "support"],
        "performance_score": 87,
        "salary": 1500,
    },
    "worker_nigar": {
        "id": 3,
        "full_name": "Nigar Hasanova",
        "role": "HR Generalist",
        "skills": ["recruitment", "interviews", "onboarding"],
        "performance_score": 89,
        "salary": 1700,
    },
}

CUSTOMERS = {
    "customer_acme": {
        "id": 1,
        "full_name": "ACME Trading",
        "email": "procurement@acme.example",
        "age": None,
        "purpose": "bulk_order",
        "purchase_history": ["Laptop Pro 14", "Smart Monitor 27"],
    },
    "customer_novatech": {
        "id": 2,
        "full_name": "NovaTech Studio",
        "email": "hello@novatech.example",
        "age": None,
        "purpose": "repeat_purchase",
        "purchase_history": ["Office Mouse", "Smart Monitor 27"],
    },
    "customer_sara": {
        "id": 3,
        "full_name": "Sara Mammadova",
        "email": "sara@example.com",
        "age": 29,
        "purpose": "career_growth",
        "purchase_history": ["Laptop Pro 14"],
    },
}

CVS = {
    "cv_amina": {
        "id": 1,
        "full_name": "Amina Aliyeva",
        "email": "amina@example.com",
        "phone": "+994501112233",
        "education": "Bachelor in Business Administration",
        "experience": "3 years in B2B sales and account management",
        "skills": ["B2B sales", "CRM", "negotiation", "lead qualification"],
        "projects": "Closed enterprise deals and built a sales pipeline dashboard",
        "expected_salary": 2500,
        "location": "Remote",
        "target_roles": ["Sales Manager", "Account Executive"],
    },
    "cv_eli": {
        "id": 2,
        "full_name": "Eli Karimov",
        "email": "eli@example.com",
        "phone": "+994501112234",
        "education": "Bachelor in Computer Science",
        "experience": "2 years in operations and reporting",
        "skills": ["SQL", "Excel", "dashboarding", "data cleaning"],
        "projects": "Automated weekly KPI reports and inventory summaries",
        "expected_salary": 1800,
        "location": "Baku",
        "target_roles": ["Data Analyst", "Operations Analyst"],
    },
    "cv_nigar": {
        "id": 3,
        "full_name": "Nigar Hasanova",
        "email": "nigar@example.com",
        "phone": "+994501112235",
        "education": "Bachelor in Human Resources",
        "experience": "4 years in recruitment and onboarding",
        "skills": ["recruitment", "interviews", "onboarding", "employee relations"],
        "projects": "Built structured interview scorecards and onboarding checklists",
        "expected_salary": 2100,
        "location": "Hybrid",
        "target_roles": ["HR Generalist", "Recruiter"],
    },
}

SKILL_GAP_PRODUCTS = {
    "sql_bootcamp": {
        "id": 101,
        "name": "SQL Bootcamp",
        "category": "Learning",
        "description": "Hands-on SQL training for analysts who need stronger query skills.",
        "cost_price": 40,
        "sell_price": 99,
        "stock": 200,
    },
    "crm_mastery": {
        "id": 102,
        "name": "CRM Mastery Workshop",
        "category": "Learning",
        "description": "Practical CRM workflow training for sales professionals.",
        "cost_price": 55,
        "sell_price": 120,
        "stock": 120,
    },
    "excel_dashboards": {
        "id": 103,
        "name": "Excel Dashboards Lab",
        "category": "Learning",
        "description": "Build reporting dashboards and KPI trackers in Excel.",
        "cost_price": 35,
        "sell_price": 89,
        "stock": 160,
    },
    "interview_skills": {
        "id": 104,
        "name": "Interview Skills Accelerator",
        "category": "Learning",
        "description": "Structured interview and onboarding toolkit for HR teams.",
        "cost_price": 30,
        "sell_price": 79,
        "stock": 140,
    },
}

SALES_CUSTOMERS = [
    {
        "name": "ACME Trading",
        "age": None,
        "goal": "bulk_order",
        "interests": ["electronics", "office equipment"],
        "purchase_history": ["Laptop Pro 14", "Smart Monitor 27"],
    },
    {
        "name": "NovaTech Studio",
        "age": None,
        "goal": "repeat_purchase",
        "interests": ["accessories", "productivity tools"],
        "purchase_history": ["Office Mouse", "Smart Monitor 27"],
    },
    {
        "name": "Sara Mammadova",
        "age": 29,
        "goal": "career_growth",
        "interests": ["laptops", "remote work"],
        "purchase_history": ["Laptop Pro 14"],
    },
]

SALES_PRODUCTS = list(PRODUCTS.values())


def get_products() -> list[dict]:
    return list(PRODUCTS.values())


def get_jobs() -> list[dict]:
    return list(JOB_LISTINGS.values())


def get_workers() -> list[dict]:
    return list(WORKERS.values())


def get_customers() -> list[dict]:
    return list(CUSTOMERS.values())