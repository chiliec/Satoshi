// https://github.com/bitcoin/bitcoin/blob/63d0b930f821132badd804822a46232a5f98bbef/src/validation.cpp#L1755-L1766
 fun getBlockSubsidy(height: Int): Int {
    let halvings: Int = height / 210000;
    if (halvings >= 64) {
        return 0;
    }
    let initialReward: Int = ton("50");
    return initialReward >> halvings;
}
