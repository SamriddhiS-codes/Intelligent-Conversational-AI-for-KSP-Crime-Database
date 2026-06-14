import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os
import math

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

cursor = conn.cursor()

df = pd.read_csv("database/ksp_crime_dataset.csv")

df['complainant_contact'] = df['complainant_contact'].astype(str)
df['is_juvenile_involved'] = df['is_juvenile_involved'].map({'Yes': True, 'No': False})
df['complainant_age'] = pd.to_numeric(df['complainant_age'], errors='coerce')
df['accused_age'] = pd.to_numeric(df['accused_age'], errors='coerce')
df['accused_count'] = pd.to_numeric(df['accused_count'], errors='coerce')
df['property_loss_inr'] = pd.to_numeric(df['property_loss_inr'], errors='coerce')
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
df = df.where(pd.notnull(df), None)

def clean(val):
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    if hasattr(val, 'item'):
        return val.item()
    return val

print(f"Total rows to import: {len(df)}")

for index, row in df.iterrows():
    cursor.execute("""
        INSERT INTO crimes (
            fir_number, district, police_station,
            crime_type, ipc_bns_sections,
            incident_date, report_date,
            location_description, latitude, longitude,
            complainant_name, complainant_age,
            complainant_gender, complainant_contact,
            accused_name, accused_age, accused_gender,
            accused_count, weapon_used, property_loss_inr,
            case_status, case_outcome,
            investigating_officer, severity,
            is_juvenile_involved
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        ON CONFLICT (fir_number) DO NOTHING;
    """, tuple(clean(row.get(col)) for col in [
        'fir_number', 'district', 'police_station',
        'crime_type', 'ipc_bns_sections',
        'incident_date', 'report_date',
        'location_description', 'latitude', 'longitude',
        'complainant_name', 'complainant_age',
        'complainant_gender', 'complainant_contact',
        'accused_name', 'accused_age', 'accused_gender',
        'accused_count', 'weapon_used', 'property_loss_inr',
        'case_status', 'case_outcome',
        'investigating_officer', 'severity',
        'is_juvenile_involved'
    ]))

    if (index + 1) % 1000 == 0:
        print(f"Imported {index + 1} rows...")

conn.commit()
print("All data imported successfully!")
print(f"{len(df)} rows inserted!")
cursor.close()
conn.close()