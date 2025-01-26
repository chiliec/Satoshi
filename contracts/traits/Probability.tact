trait Probability {
    const BASE_THRESHOLD: Int = 10;
    const MAX_PROBABILITY: Int = 100;
    const MIN_PROBABILITY: Int = 1;

    fun calculateBlockProbability(minutesSinceLastBlock: Int, attemptsSinceLastBlock: Int): Int {
        let timeFactor: Int = (minutesSinceLastBlock * self.MAX_PROBABILITY) / self.BASE_THRESHOLD;
        let adjustedTimeFactor: Int = min(self.MAX_PROBABILITY, max(self.MIN_PROBABILITY, timeFactor));

        let attemptsFactor: Int = attemptsSinceLastBlock > 0
            ? self.MAX_PROBABILITY / attemptsSinceLastBlock
            : self.MAX_PROBABILITY;

        let rawProbability: Int = (adjustedTimeFactor * attemptsFactor) / self.MAX_PROBABILITY;

        let linearGrowth: Int = minutesSinceLastBlock > self.BASE_THRESHOLD
            ? (minutesSinceLastBlock - self.BASE_THRESHOLD) * self.BASE_THRESHOLD
            : 0;

        let finalProbability: Int = rawProbability + (minutesSinceLastBlock / self.BASE_THRESHOLD) + linearGrowth;

        return max(self.MIN_PROBABILITY, min(self.MAX_PROBABILITY, finalProbability));
    }
}
