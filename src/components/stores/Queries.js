export const authenticationQuery = `query ($request: LoginRequest!) {
  authenticate(request:$request) {
    id,
    email,
    name,
    userType
  }
}`

export const programsQuery = `query ($criteria: ProgramCriteria!) {
  getPrograms(criteria: $criteria) {
    programs {
      program {
        id
        active
        name
        description
        coachName
      }
      coach {
        id
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
      id,
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
    id,
    email,
    name
  }
}`;

export const createSessionQuery = `mutation($input: NewSessionRequest!) {
  createSession(newSessionRequest:$input){
    session {
      id,
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
    session{
      id,
      people,
      name,
      description,
      duration,
      scheduleStart,
      scheduleEnd,
      status,
      isClosed
    }
    errors {
      field
      message
    }
  }
}`

export const eventsQuery = `query ($criteria: EventCriteria!) {
  getSessions(criteria: $criteria) {
    session {
      id,
      people,
      name,
      description,
      duration,
      scheduleStart,
      scheduleEnd,
      status,
      isClosed
    }
    program {
      name
      id
    }
    sessionUser{
      id
      userType
    }
    
  }
}`;

export const sessionUsersQuery =  `query ($criteria: SessionCriteria!) {
  getSessionUsers(criteria: $criteria) {
    users {
      sessionUser {
        id
        userType
      }
      user {
        id
        email
        name
        userType
      }
    }
    error {
      message
    }
  }
}`

export const createNotesQuery = `mutation ($input: NewNoteRequest!) {
  createNote(newNoteRequest: $input) {
    note {
      description,
      id
    }
    errors {
      field,
      message
    }
  }
}`