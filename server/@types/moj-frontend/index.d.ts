/**
 * MoJ Frontend types based on v8.0.0
 * NB: this was recreated manually from javascript sources and remains incomplete!
 * For example, not all concrete component classes are included.
 */

// eslint-disable-next-line max-classes-per-file
declare module '@ministryofjustice/frontend' {
  import type { Component, createAll } from 'govuk-frontend'

  export function initAll(scopeOrConfig?: Parameters<createAll>[0]): void

  export class DatePicker extends Component {}

  export class SortableTable extends Component {}
}
