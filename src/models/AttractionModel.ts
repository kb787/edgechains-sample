import db from "../config/connection";
export interface Attraction {
  id?: number;
  destination_id: number;
  name: string;
  type: string;
  description?: string;
  interests: string[];
  estimated_cost?: number;
  recommended_duration?: number;
}

export class AttractionModel {
  static async create(attraction: Attraction): Promise<Attraction> {
    const query = `
      INSERT INTO attractions 
      (destination_id, name, type, description, interests, estimated_cost, recommended_duration) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      attraction.destination_id,
      attraction.name,
      attraction.type,
      attraction.description,
      attraction.interests,
      attraction.estimated_cost,
      attraction.recommended_duration,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByDestination(
    destinationId: number,
    interests?: string[]
  ): Promise<Attraction[]> {
    let query = "SELECT * FROM attractions WHERE destination_id = $1";
    const params: any[] = [destinationId];

    if (interests && interests.length > 0) {
      query += " AND interests && $2";
      params.push(interests);
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}
