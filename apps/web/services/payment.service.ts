/**
 * Service to handle payment calculations and currency conversions.
 */
export class PaymentService {
    /**
     * Convert ADA to Lovelace
     * @param ada Amount in ADA
     * @returns Amount in Lovelace (integer)
     */
    static adaToLovelace(ada: number): number {
        return Math.floor(ada * 1_000_000);
    }

    /**
     * Convert Lovelace to ADA
     * @param lovelace Amount in Lovelace
     * @returns Amount in ADA
     */
    static lovelaceToAda(lovelace: number): number {
        return lovelace / 1_000_000;
    }

    /**
     * Calculate revenue splits based on price and percentages.
     * @param priceLovelace Total price in Lovelace
     * @param distribution Percentages for distribution
     * @returns Object containing calculated amounts in Lovelace
     */
    static calculateRevenueSplits(
        priceLovelace: number,
        distribution: {
            creatorPercent: number;
            schoolFundPercent: number;
            platformPercent: number;
        }
    ): {
        creatorAmount: number;
        schoolAmount: number;
        platformAmount: number;
    } {
        const creatorAmount = Math.floor(
            (priceLovelace * distribution.creatorPercent) / 100
        );
        const schoolAmount = Math.floor(
            (priceLovelace * distribution.schoolFundPercent) / 100
        );
        const platformAmount = Math.floor(
            (priceLovelace * distribution.platformPercent) / 100
        );

        return {
            creatorAmount,
            schoolAmount,
            platformAmount,
        };
    }
}
