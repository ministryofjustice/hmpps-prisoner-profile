import { AssessmentQualificationType } from "../data/enums/dpsCore"

export interface LearnerProfile {
         prn   :    string   
         establishmentId   :    string   
         establishmentName   :    string   
         uln   :    string   
         lddHealthProblem   :    string   
         priorAttainment   :    string   
         qualifications   : [
        {
             qualificationType   :    AssessmentQualificationType
             qualificationGrade   :    string   
             assessmentDate   :    string  
        }
      ],
         languageStatus   :    string 
         plannedHours   :   number
         rapidAssessmentDate   :   string 
         inDepthAssessmentDate   :   string 
         primaryLDDAndHealthProblem   :    string   
         additionalLDDAndHealthProblems   : string[]
}
  