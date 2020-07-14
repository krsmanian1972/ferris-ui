export const programsQuery = `query ($criteria: ProgramCriteria!) {
    getPrograms(criteria: $criteria) {
          program {
        fuzzyId
        active
        name
        description
          }
    }
}`;

export const createProgramQuery = `mutation ($input: NewProgramRequest!) {
  createProgram(newProgramRequest: $input) {
    error {
      field,
      message
    }
   
    program{
      fuzzyId,
      name
    }
  }
}`;

export const createSessionQuery = `mutation($input: NewSessionRequest!) {
  createSession(newSessionRequest:$input){
    session {
      fuzzyId,
      name
    }
    error {
      field,
      message
    } 
  }
}`

