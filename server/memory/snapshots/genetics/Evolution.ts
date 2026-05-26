import { eventBus } from '../../../events/event-bus/Bus';
import { NexusEvent } from '../../../events/event-bus/Registry';
import { activeGenome } from './Genome';
import { positionManager } from '../../../runtime/positionManager';

class GeneticEvolution {
  constructor() {
    this.startEvolutionLoop();
  }

  private startEvolutionLoop() {
    // Mutate somewhat frequently for the sake of the simulation
    setInterval(() => {
      this.evaluateAndMutate();
    }, 150000); // every 2.5 minutes
  }

  private evaluateAndMutate() {
    const portfolio = positionManager.getPortfolioState();
    
    // Define a basic fitness score [0 to 1]
    let fitness = 0.5;

    // Check Win Rate (50% is baseline)
    const winRate = portfolio.winRate / 100;

    // Check PnL
    const hasProfit = portfolio.netPnL > 0;

    // Check Drawdown (0 to 100)
    const drawdown = portfolio.maxDrawdown;

    if (hasProfit) {
      fitness += 0.2;
    } else {
      fitness -= 0.2;
    }

    if (winRate > 0.55) {
      fitness += 0.1;
    }

    if (drawdown > 10) {
      fitness -= 0.2;
    }

    fitness = Math.max(0.1, Math.min(1.0, fitness)); // Bound between 0.1 and 1

    console.log(`[EVOLUTION] Evaluating Fitness: Score = ${fitness.toFixed(2)}, WinRate = ${portfolio.winRate.toFixed(1)}%, Drawdown = ${portfolio.maxDrawdown.toFixed(1)}%`);

    // Only mutate if fitness isn't perfect
    if (fitness < 0.9) {
        activeGenome.mutate(fitness);
    } else {
        console.log(`[EVOLUTION] High fitness achieved, avoiding mutations.`);
    }
  }
}

export const geneticEvolution = new GeneticEvolution();
