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
      enrollmentId
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
  getEvents(criteria: $criteria) {
    sessions {
      session {
        id,
        enrollmentId,
        people,
        name,
        description,
        duration,
        scheduleStart,
        scheduleEnd,
        status,
        isClosed,
        closingNotes,
      }
      program {
        name,
        id
      }
      sessionUser{
        id,
        userType
      }
    }
  }
}`;

export const sessionUsersQuery = `query ($criteria: SessionCriteria!) {
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
}`;

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
}`;

export const notesQuery = `query ($criteria: NoteCriteria!) {
  getNotes(criteria: $criteria) {
    notes {
        id,
        description,
        remindAt
    }
    error{
      message
    }
  }
}`;

export const createObjectiveQuery = `mutation($input: NewObjectiveRequest!) {
  createObjective(newObjectiveRequest:$input){
    objective {
      id,
      description,
      scheduleStart,
      scheduleEnd,
      createdAt,
      status
    }
    errors {
      field,
      message
    } 
  }
}`;

export const updateObjectiveQuery = `mutation ($input: UpdateObjectiveRequest!) {
  updateObjective(updateObjectiveRequest:$input) {
    objective {
      id
      description
      scheduleStart
      scheduleEnd
      createdAt
      status
    }
    errors {
      message
    }
  }
}`;

export const objectivesQuery = `query ($criteria: PlanCriteria!) {
  getObjectives(criteria: $criteria) {
    objectives {
        id,
        enrollmentId,
        description,
        scheduleStart,
        scheduleEnd,
        status,
        createdAt
    }
    error{
      message
    }
  }
}`

export const createTaskQuery = `mutation($input: NewTaskRequest!) {
  createTask(newTaskRequest:$input){
    task {
      id,
      scheduleStart,
      scheduleEnd,
      createdAt,
      status
    }
    errors {
      field,
      message
    } 
  }
}`;

export const tasksQuery = `query ($criteria: PlanCriteria!) {
  getTasks(criteria: $criteria) {
    tasks {
        id,
        name,
        enrollmentId,
        description,
        duration,
        scheduleStart,
        scheduleEnd,
        status,
        createdAt
    }
    error{
      message
    }
  }
}`;

export const createObservationQuery = `mutation($input: NewObservationRequest!) {
  createObservation(newObservationRequest:$input){
    observation {
      id,
      createdAt,
    }
    errors {
      field,
      message
    } 
  }
}`;

export const updateObservationQuery =`mutation ($input: UpdateObservationRequest!) {
  updateObservation(updateObservationRequest:$input) {
    observation {
      id
      enrollmentId
      description
    }
    errors {
      message
    }
  }
}`;

export const updateOptionQuery = `mutation ($input: UpdateOptionRequest!) {
  updateOption(updateOptionRequest:$input) {
    constraint {
      id
      enrollmentId
      description
    }
    errors {
      message
    }
  }
}`;

export const updateTaskQuery = `mutation ($input: UpdateTaskRequest!) {
  updateTask(updateTaskRequest:$input) {
    task {
      id
      name
      description
      duration
      scheduleStart
    }
    errors {
      message
    }
  }
}`;

export const observationsQuery = `query ($criteria: PlanCriteria!) {
  getObservations(criteria: $criteria) {
    observations {
        id,
        enrollmentId,
        description,
        createdAt
    }
    error{
      message
    }
  }
}`;

export const createConstraintQuery = `mutation($input: NewOptionRequest!) {
  createOption(newOptionRequest:$input){
    constraint {
      id,
      createdAt,
    }
    errors {
      field,
      message
    } 
  }
}`;

export const constraintsQuery = `query ($criteria: PlanCriteria!) {
  getOptions(criteria: $criteria) {
    constraints {
        id,
        enrollmentId,
        description,
        createdAt
    }
    error{
      message
    }
  }
}`;