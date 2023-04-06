import { SentenceTerm } from "../../interfaces/prisonApi/sentenceTerms"

const SentenceTermsMock: SentenceTerm[] =  [
    {
        bookingId: 1102484,
        sentenceSequence: 4,
        termSequence: 1,
        sentenceType: 'ADIMP',
        sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
        startDate: '2020-03-02',
        years: 100,
        lifeSentence: false,
        caseId: '1563148',
        fineAmount: 10000,
        sentenceTermCode: 'IMP',
        lineSeq: 4,
        sentenceStartDate: '2020-03-02'
    },
    {
        bookingId: 1102484,
        sentenceSequence: 5,
        termSequence: 1,
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        years: 10,
        lifeSentence: false,
        caseId: '1563148',
        sentenceTermCode: 'IMP',
        lineSeq: 5,
        sentenceStartDate: '2020-03-02'
    },
    {
        bookingId: 1102484,
        sentenceSequence: 5,
        termSequence: 2,
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2030-03-02',
        years: 5,
        lifeSentence: false,
        caseId: '1563148',
        sentenceTermCode: 'LIC',
        lineSeq: 5,
        sentenceStartDate: '2020-03-02'
    },
    {
        bookingId: 1102484,
        sentenceSequence: 5,
        termSequence: 3,
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        years: 6,
        lifeSentence: false,
        caseId: '1563148',
        sentenceTermCode: 'LIC',
        lineSeq: 5,
        sentenceStartDate: '2020-03-02'
    },
    {
        bookingId: 1102484,
        sentenceSequence: 5,
        termSequence: 4,
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        years: 2,
        lifeSentence: false,
        caseId: '1563148',
        sentenceTermCode: 'LIC',
        lineSeq: 5,
        sentenceStartDate: '2020-03-02'
    }
]

export default SentenceTermsMock