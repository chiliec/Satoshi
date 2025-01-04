trait Probability {

    const baseThreshold: Int = 10; // Minutes after which the probability increases significantly
    const maxProbability: Int = 100; // Maximum probability (100%)
    const minProbability: Int = 1; // Minimum probability (1%)

    fun getProbability(
        minutesSinceLastBlock: Int,
        attemptsSinceLastBlock: Int
    ): Int {
        // Calculate the influence of time
        let timeFactor = minutesSinceLastBlock >= self.baseThreshold
            ? pow((minutesSinceLastBlock - self.baseThreshold) / self.baseThreshold + 1, 3)
            : pow(minutesSinceLastBlock / self.baseThreshold, 2);

        // Calculate the influence of attempts with smoother reduction
        let attemptsFactor = attemptsSinceLastBlock > 0
            ? 1 / log2(attemptsSinceLastBlock + 2)
            : 1;

        // Combine factors to compute raw probability
        let probability = self.maxProbability * timeFactor * attemptsFactor;

        // Clamp probability within the range of minProbability to maxProbability
        probability = max(self.minProbability, min(self.maxProbability, probability));

        return probability;
    }

}
