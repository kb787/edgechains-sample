import { ErrorHandler } from "../utils/ErrorHandler";
import { AttractionModel, Attraction } from "../models/AttractionModel";
import { DestinationModel, Destination } from "../models/DestinationModel";

export interface TravelRecommendation {
  destination: Destination;
  attractions: Attraction[];
  recommendedActivities: string[];
}

export class TravelRecommendationService {
  async getRecommendations(
    interests: string[],
    budget: string
  ): Promise<TravelRecommendation[]> {
    try {
      // Get destinations that match interests
      const destinations = await this.findMatchingDestinations(interests);

      // Get recommendations for each destination
      const recommendations: TravelRecommendation[] = [];

      for (const destination of destinations) {
        const attractions = await this.findAttractions(
          destination.id!,
          interests
        );

        recommendations.push({
          destination,
          attractions,
          recommendedActivities: this.generateActivityRecommendations(
            attractions,
            budget
          ),
        });
      }

      return recommendations;
    } catch (error) {
      ErrorHandler.handle(error, "Travel Recommendations");
      return [];
    }
  }

  private async findMatchingDestinations(
    interests: string[]
  ): Promise<Destination[]> {
    // In a real scenario, this would use more complex matching
    const allDestinations = await DestinationModel.list();

    return allDestinations.filter((destination) =>
      this.hasMatchingInterests(destination, interests)
    );
  }

  private async findAttractions(
    destinationId: number,
    interests: string[]
  ): Promise<Attraction[]> {
    return await AttractionModel.findByDestination(destinationId, interests);
  }

  private hasMatchingInterests(
    destination: Destination,
    interests: string[]
  ): boolean {
    // Placeholder logic - in real-world, this would be more sophisticated
    const destinationInterests = [
      "technology",
      "culture",
      "food",
      "history",
      "nature",
    ];

    return interests.some((interest) =>
      destinationInterests.includes(interest.toLowerCase())
    );
  }

  private generateActivityRecommendations(
    attractions: Attraction[],
    budget: string
  ): string[] {
    // Generate activity recommendations based on attractions and budget
    const budgetFactors = {
      low: 0.5,
      moderate: 0.75,
      high: 1,
    };

    const budgetFactor =
      budgetFactors[budget as keyof typeof budgetFactors] || 0.75;

    return attractions
      .filter(
        (attraction) => (attraction.estimated_cost || 0) * budgetFactor <= 100 // Example budget constraint
      )
      .slice(0, 5) // Limit to top 5 recommendations
      .map((attraction) => attraction.name);
  }

  async getDetailedAttractionInfo(
    attractionId: number
  ): Promise<Attraction | null> {
    try {
      // Fetch detailed information about a specific attraction
      // In a real-world scenario, this might involve additional API calls or data enrichment
      return null; // Placeholder
    } catch (error) {
      ErrorHandler.handle(error, `Attraction Details for ID ${attractionId}`);
      return null;
    }
  }
}
