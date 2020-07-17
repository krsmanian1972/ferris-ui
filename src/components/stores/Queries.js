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
}`;

export const enrollmentsQuery = `query ($criteria: EnrollmentCriteria!) {
  getEnrollments(criteria: $criteria) {
    fuzzyId,
    email,
    name
  }
}`;

export const eventsQuery = `query ($criteria: EventCriteria!) {
  getSessions(criteria: $criteria) {
    session {
      people,
      name,
      fuzzyId,
      description,
      duration,
      scheduleStart,
      scheduleEnd,
      status
    }
    program {
      name
    }
    sessionUser{
      fuzzyId
      userType
    }
    
  }
}`;