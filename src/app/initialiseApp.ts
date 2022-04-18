import { EnvironmentsService } from './services/environments.service';

export class Initialiser {
  static initialiseApp(config: EnvironmentsService): () => Promise<void> {
    return () => config.load();
  }
}

