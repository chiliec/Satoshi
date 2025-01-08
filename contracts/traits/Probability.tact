trait Probability {
    const baseThreshold: Int = 10;
    const maxProbability: Int = 100;
    const minProbability: Int = 1;
    const scale: Int = 1000000;

    fun calculateBlockProbability(minutesSinceLastBlock: Int, attemptsSinceLastBlock: Int): Int {
        let timeFactor: Int = minutesSinceLastBlock * minutesSinceLastBlock * 10000 / self.scale;

        let attemptsFactor: Int = (attemptsSinceLastBlock > 0)
            ? self.scale / log2(attemptsSinceLastBlock + 2)
            : self.scale;

        let rawProbability: Int = self.maxProbability * timeFactor * attemptsFactor / self.scale;
        return max(self.minProbability, min(self.maxProbability, rawProbability));
    }
}