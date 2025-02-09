import matplotlib.pyplot as plt

BASE_THRESHOLD = 10
MAX_PROBABILITY = 100
MIN_PROBABILITY = 1

def calculate_block_probability(minutes_since_last_block, attempts_since_last_block):
    time_factor = (minutes_since_last_block * MAX_PROBABILITY) // BASE_THRESHOLD
    adjusted_time_factor = min(MAX_PROBABILITY, max(MIN_PROBABILITY, time_factor))

    attempts_factor = (
        MAX_PROBABILITY // (attempts_since_last_block)
        if attempts_since_last_block > 0
        else MAX_PROBABILITY
    )

    raw_probability = (adjusted_time_factor * attempts_factor) // MAX_PROBABILITY

    linear_growth = (
        (minutes_since_last_block - BASE_THRESHOLD) * BASE_THRESHOLD
        if minutes_since_last_block > BASE_THRESHOLD
        else 0
    )

    final_probability = (
        raw_probability + (minutes_since_last_block // BASE_THRESHOLD) + linear_growth
    )

    return max(MIN_PROBABILITY, min(MAX_PROBABILITY, final_probability))


minutes = [i * 0.1 for i in range(200)]  # Minutes with step 0.1
attempts_values = [1, 2, 3, 5, 10, 20]

plt.figure(figsize=(10, 6))
for attempts in attempts_values:
    probabilities = [
        calculate_block_probability(minute, attempts) for minute in minutes
    ]
    plt.plot(minutes, probabilities, label=f"attempts = {attempts}")

plt.title("Probability vs Minutes Since Last Block")
plt.xlabel("Minutes Since Last Block")
plt.ylabel("Probability")
plt.legend()
plt.grid(True)
plt.show()
