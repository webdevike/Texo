import { defineExtension } from '../../../experiments/contracts-spike/contracts/extension';
import { fieldListDemo } from './definition';

export default defineExtension({
  id: 'field-list',
  name: 'Field List',
  components: { [fieldListDemo.id]: fieldListDemo },
});
