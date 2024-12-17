import db from "../config/connection";

export interface Destination {
  id?: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export class DestinationModel {
  static async create(destination: Destination): Promise<Destination> {
    const query = `
      INSERT INTO destinations 
      (name, country, latitude, longitude, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      destination.name,
      destination.country,
      destination.latitude,
      destination.longitude,
      destination.description || null,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByName(name: string): Promise<Destination | null> {
    const query = "SELECT * FROM destinations WHERE name = $1";
    const result = await db.query(query, [name]);
    return result.rows[0] || null;
  }

  static async list(country?: string): Promise<Destination[]> {
    let query = "SELECT * FROM destinations";
    const params: any[] = [];

    if (country) {
      query += " WHERE country = $1";
      params.push(country);
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}
