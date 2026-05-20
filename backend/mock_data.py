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
}

JOB_LISTINGS = {
    "sales_manager": {
        "id": 1,
        "title": "Sales Manager",
        "company_name": "Buildathon Mart",
        "required_skills": ["B2B sales", "CRM", "negotiation"],
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
        "experience_years": "4+",
        "salary_min": 2200,
        "salary_max": 3800,
        "location": "Hybrid",
    },
}

WORKERS = {
    "worker_amina": {
        "id": 1,
        "full_name": "Amina Aliyeva",
        "role": "Sales Specialist",
        "skills": ["lead qualification", "CRM", "proposal writing"],
        "performance_score": 91,
    },
    "worker_eli": {
        "id": 2,
        "full_name": "Eli Karimov",
        "role": "Operations Associate",
        "skills": ["inventory", "order tracking", "support"],
        "performance_score": 87,
    },
    "worker_nigar": {
        "id": 3,
        "full_name": "Nigar Hasanova",
        "role": "HR Generalist",
        "skills": ["recruitment", "interviews", "onboarding"],
        "performance_score": 89,
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