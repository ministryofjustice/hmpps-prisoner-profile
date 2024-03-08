import CsraAssessment from '../data/interfaces/prisonApi/CsraAssessment'

export default (questions: CsraAssessment['questions']) =>
  questions
    ?.filter(q => !!q.answer)
    .map(qu => ({
      key: { text: qu.question, classes: 'govuk-!-font-weight-regular' },
      value: { text: qu.answer },
    }))
