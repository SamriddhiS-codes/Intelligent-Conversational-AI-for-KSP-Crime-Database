from sqlalchemy import text
from sqlalchemy.orm import Session

def get_hotspots(db: Session, limit: int = 10) -> list[dict]:
    sql = """
        SELECT district, police_station, crime_type,
               COUNT(*) as crime_count,
               AVG(latitude::float) as lat,
               AVG(longitude::float) as lng
        FROM crimes
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY district, police_station, crime_type
        ORDER BY crime_count DESC
        LIMIT :limit
    """
    rows = db.execute(text(sql), {"limit": limit}).fetchall()
    return [dict(zip(r._fields, r)) for r in rows]

def get_crime_trends(db: Session, district: str = None) -> list[dict]:
    where = "WHERE district ILIKE :district" if district else ""
    params = {"district": f"%{district}%"} if district else {}
    sql = f"""
        SELECT
            EXTRACT(YEAR FROM incident_date)::int AS year,
            EXTRACT(MONTH FROM incident_date)::int AS month,
            crime_type,
            COUNT(*) as count
        FROM crimes
        WHERE incident_date IS NOT NULL
        {"AND district ILIKE :district" if district else ""}
        GROUP BY year, month, crime_type
        ORDER BY year, month
    """
    rows = db.execute(text(sql), params).fetchall()
    return [dict(zip(r._fields, r)) for r in rows]

def get_crime_by_district(db: Session) -> list[dict]:
    sql = """
        SELECT district, COUNT(*) as total,
               SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high_severity,
               SUM(CASE WHEN case_status ILIKE '%investigation%' THEN 1 ELSE 0 END) as open_cases,
               ROUND(AVG(property_loss_inr)::numeric, 2) as avg_property_loss
        FROM crimes
        WHERE district IS NOT NULL
        GROUP BY district
        ORDER BY total DESC
    """
    rows = db.execute(text(sql)).fetchall()
    result = []
    for r in rows:
        d = dict(zip(r._fields, r))
        for k, v in d.items():
            if hasattr(v, '__float__'):
                d[k] = float(v)
        result.append(d)
    return result

def get_crime_type_breakdown(db: Session) -> list[dict]:
    sql = """
        SELECT crime_type, COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM crimes
        GROUP BY crime_type
        ORDER BY count DESC
    """
    rows = db.execute(text(sql)).fetchall()
    return [dict(zip(r._fields, r)) for r in rows]

def get_network_data(db: Session, crime_type: str = None, district: str = None) -> dict:
    """Return nodes and edges for criminal network visualization."""
    where_clauses = ["accused_name IS NOT NULL"]
    params = {}
    if crime_type:
        where_clauses.append("crime_type ILIKE :crime_type")
        params["crime_type"] = f"%{crime_type}%"
    if district:
        where_clauses.append("district ILIKE :district")
        params["district"] = f"%{district}%"

    where = "WHERE " + " AND ".join(where_clauses)

    sql = f"""
        SELECT accused_name, crime_type, district, COUNT(*) as appearances
        FROM crimes
        {where}
        GROUP BY accused_name, crime_type, district
        ORDER BY appearances DESC
        LIMIT 50
    """
    rows = db.execute(text(sql), params).fetchall()

    nodes = []
    edges = []
    seen_nodes = set()

    for r in rows:
        accused = r[0]
        crime = r[1]
        district_name = r[2]

        if accused not in seen_nodes:
            nodes.append({"id": accused, "label": accused, "type": "person", "size": r[3]})
            seen_nodes.add(accused)

        crime_node_id = f"{crime}_{district_name}"
        if crime_node_id not in seen_nodes:
            nodes.append({"id": crime_node_id, "label": f"{crime} ({district_name})", "type": "crime"})
            seen_nodes.add(crime_node_id)

        edges.append({"from": accused, "to": crime_node_id, "weight": r[3]})

    return {"nodes": nodes, "edges": edges}
