"""
Synthetic dataset generator for the Voice Check (human vs synthetic) classifier.

Mirrors the "Audio Insights" features already shown in home.html
(accent consistency, pitch stability, frequency pattern, model confidence)
so the GCP model lines up with what the app already displays.

No real audio was used — every row is generated from randomized
distributions with an intentional gap between the two classes.
"""

import csv
import random

random.seed(42)

N_PER_CLASS = 300


def human_row():
    return {
        "pitch_stability": round(random.gauss(78, 10), 2),
        "accent_consistency": round(random.gauss(75, 12), 2),
        "frequency_anomaly_score": round(random.gauss(18, 8), 2),
        "pause_naturalness": round(random.gauss(80, 9), 2),
        "duration_sec": round(random.uniform(8, 90), 1),
        "label": "human",
    }


def synthetic_row():
    return {
        "pitch_stability": round(random.gauss(35, 12), 2),
        "accent_consistency": round(random.gauss(40, 15), 2),
        "frequency_anomaly_score": round(random.gauss(72, 10), 2),
        "pause_naturalness": round(random.gauss(30, 11), 2),
        "duration_sec": round(random.uniform(5, 60), 1),
        "label": "synthetic",
    }


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def build_rows():
    rows = []
    for _ in range(N_PER_CLASS):
        r = human_row()
        for k in ("pitch_stability", "accent_consistency", "frequency_anomaly_score", "pause_naturalness"):
            r[k] = clamp(r[k])
        rows.append(r)
    for _ in range(N_PER_CLASS):
        r = synthetic_row()
        for k in ("pitch_stability", "accent_consistency", "frequency_anomaly_score", "pause_naturalness"):
            r[k] = clamp(r[k])
        rows.append(r)
    random.shuffle(rows)
    return rows


def main():
    rows = build_rows()
    fieldnames = [
        "pitch_stability",
        "accent_consistency",
        "frequency_anomaly_score",
        "pause_naturalness",
        "duration_sec",
        "label",
    ]
    out_path = "voice_check_dataset.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    main()
