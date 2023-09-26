workspace {

    model {
        user = person " Prison Staff User" "Someone who needs access to prisoner information to carry out their duties"
        prisonerProfile = softwareSystem "HMPPS Prisoner Profile" "Used in day to day management of prisoners, by Prison Staff"{
            tags "HMPPS Digital Service"
            prisonerProfileUI = container "Prisoner Profile UI"
        } 

        HMPPSAuth = softwareSystem "HMPPS Auth" "Authentication and Authorization server"{
            tokenVerificationAPI = container "Token Verification API"
            AuthorizationServer = container "HMPPS Auth Server"

        }

        NOMIS = softwareSystem "NOMIS" {
            tags "Legacy System"
            prisonApi = container "Prison API"
            database  = container "NOMIS DB"

            prisonApi -> database "reads / writes"
        }

        HMPPSDigitalServices = softwareSystem "HMPPS Digital Services"{
            tags "HMPPS Digital Service" 
            
                prisonerSearchAPI = container "Prisoner Search API"
                allocationManagerAPI = container "Allocation Manager API"
                keyworkerAPI = container "Keyworker API"
                whereaboutsAPI = container "Whereabouts API"
                caseNotesAPI = container "Case notes API"
                incentivesAPI = container "Incentives API"
                pathfinderAPI = container "Pathfinder API"
                manageSOCCasesAPI = container "Manage SOC Cases API"
                nonAssociationsAPI = container "Non-associations API"
                manageAdjudicationsAPI = container "Manage Adjudications API"
                componentsAPI =  container "Components Micro-frontend API"

        }

        ExternalSystems = softwareSystem "External Systems" {
            tags "External System"
            CuriousAPI = container "Curious API"
        }
        
        user -> prisonerProfile "Uses"

        prisonerProfile -> NOMIS "Retrieves Prisoner related information"
        prisonerProfile -> HMPPSDigitalServices "Retrieves Prisoner related information"
        prisonerProfile -> CuriousAPI "retreives virtual campus information"        
        prisonerProfile -> prisonApi "API call"
        prisonerProfile -> prisonerSearchAPI "API Call"
        prisonerProfile -> allocationManagerAPI  "API Call"
        prisonerProfile -> keyworkerAPI  "API Call"
        prisonerProfile -> whereaboutsAPI  "API Call"
        prisonerProfile -> caseNotesAPI  "API Call"
        prisonerProfile -> incentivesAPI  "API Call"
        prisonerProfile -> pathfinderAPI  "API Call"
        prisonerProfile -> manageSOCCasesAPI  "API Call"
        prisonerProfile -> nonAssociationsAPI  "API Call"
        prisonerProfile -> manageAdjudicationsAPI  "API Call"
        prisonerProfile -> componentsAPI  "API Call"

    }

    views {
        systemContext prisonerProfile "Profile" {
            include *
        }

        container HMPPSDigitalServices "DigitalServices" {
            include *

        }

         container NOMIS "NOMIS"{
            include *
    
         }

         container ExternalSystems "ExternalSystems" {
            include *
        
         }

        styles {

            element "Software System" {
                background #1168bd
                color #ffffff
            }

            element "Legacy System" {
                background #cccccc
                color #000000
            }  
            element "External System" {
                background #3598EE
                color #000000
            }             
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
        }
    }
    
}