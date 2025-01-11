trait Probability {
    const baseThreshold: Int = 10;
    const maxProbability: Int = 100;
    const minProbability: Int = 1;

    fun calculateBlockProbability(minutesSinceLastBlock: Int, attemptsSinceLastBlock: Int): Int {
        let timeFactor: Int = (minutesSinceLastBlock * self.maxProbability) / self.baseThreshold;
        timeFactor = min(self.maxProbability, max(self.minProbability, timeFactor));
        let attemptsFactor: Int = attemptsSinceLastBlock > 0
            ? self.maxProbability / attemptsSinceLastBlock
            : self.maxProbability;
        let rawProbability: Int = (timeFactor * attemptsFactor) / self.maxProbability;
        return max(self.minProbability, min(self.maxProbability, rawProbability));
    }
}
