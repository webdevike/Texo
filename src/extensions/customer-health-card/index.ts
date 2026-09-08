import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';
import { customerHealthCard } from './definition';

export default defineExtension({
  id: 'customer-health-card',
  name: 'Customer Health Card',
  components: { [customerHealthCard.id]: customerHealthCard },
});
