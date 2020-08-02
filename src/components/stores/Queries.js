export const authenticationQuery = `query ($request: LoginRequest!) {
  authenticate(request:$request) {
    fuzzyId,
    email,
    name,
    userType
  }
}`

export const programsQuery = `query ($criteria: ProgramCriteria!) {
  getPrograms(criteria: $criteria) {
    programs {
      program {
        fuzzyId
        active
        name
        description
        coachName
      }
      coach {
        fuzzyId
        email
        name
      }
      enrollmentStatus
    }
    error {
      message
    }
  }   
}`


export const createProgramQuery = `mutation ($input: NewProgramRequest!) {
  createProgram(newProgramRequest: $input) {
    errors {
      field,
      message
    }
   
    program{
      fuzzyId,
      name
    }
  }
}`;

export const alterProgramStateQuery = `mutation($input: ChangeProgramStateRequest!) {
  alterProgramState(request: $input) {
    rows,
    errors {
      field
      message
    }
  }
}`


export const createEnrollmentQuery = `mutation ($input: NewEnrollmentRequest!) {
  createEnrollment(newEnrollmentRequest: $input) {
    errors {
      field,
      message
    }
    enrollment {
      id
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

export const createSessionQuery = `mutation($input: NewSessionRequest!) {
  createSession(newSessionRequest:$input){
    session {
      fuzzyId,
      name
    }
    errors {
      field,
      message
    } 
  }
}`;

export const alterSessionStateQuery = `mutation($input: ChangeSessionStateRequest!) {
  alterSessionState(request: $input) {
    rows,
    errors {
      field
      message
    }
  }
}`

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
      status,
      isClosed
    }
    program {
      name
      fuzzyId
    }
    sessionUser{
      fuzzyId
      userType
    }
    
  }
}`;

export const sessionUsersQuery =  `query ($criteria: SessionCriteria!) {
  getSessionUsers(criteria: $criteria) {
    users{
      member {
        fuzzyId
        email
        name
      }
      coach {
        fuzzyId
        email
        name
      }
    },
    error {
      message
    }
  }
}`

export const createNotesQuery = `mutation ($input: NewNoteRequest!) {
  createNote(newNoteRequest: $input) {
    note {
      description,
      fuzzyId
    }
    errors {
      field,
      message
    }
  }
}`