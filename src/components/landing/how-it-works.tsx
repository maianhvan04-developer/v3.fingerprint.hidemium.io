import { ArrowRightMini } from "@/components/icons";
import styles from "./overview-footer.module.css";

const steps = [
  {
    body: "We gather 50+ signals from the browser, device, and network in real time.",
    number: "1",
    title: "Collect Signals",
  },
  {
    body: "Advanced algorithms correlate signals to build a unique fingerprint.",
    number: "2",
    title: "Analyze",
  },
  {
    body: "You get actionable results to make smarter, faster decisions.",
    number: "3",
    title: "Deliver Insights",
  },
] as const;

export function HowItWorks() {
  return (
    <section className={styles.process} id="how-it-works" aria-labelledby="process-title">
      <div className={styles.processIntro}>
        <h2 id="process-title">How it works</h2>
        <p>Powerful fingerprinting in three simple steps.</p>
      </div>

      <ol className={styles.processSteps}>
        {steps.map((step, index) => (
          <li className={styles.processStep} key={step.number}>
            <span className={styles.stepNumber}>{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            {index < steps.length - 1 ? <ArrowRightMini className={styles.stepArrow} /> : null}
          </li>
        ))}
      </ol>

      <aside className={styles.processCta}>
        <div>
          <strong>Ready to secure your platform?</strong>
          <span>Start detecting fraud and bots in minutes.</span>
        </div>
        <a href="#top">
          Start free trial
          <ArrowRightMini />
        </a>
      </aside>
    </section>
  );
}
