export const authenticationQuery = `query ($request: LoginRequest!) {
  authenticate(request:$request) {
    id,
    email,
    name,
    userType
  }
}`

export const registrationQuery = `mutation($input: Registration!) {
  createUser(registration:$input) {
    user {
    id
    email
    name
    userType 
    }
    errors {
      field
      message
    }
  } 
}`

export const resetPasswordQuery = `mutation($input: ResetPasswordRequest!) {
  resetPassword(request: $input) {
    user {
    id
    email
    name
    userType 
    }
    errors {
      field
      message
    }
  } 
}`

export const findUserQuery = `query ($criteria: UserCriteria!) {
  getUser(criteria: $criteria) {
        id
        email
        name
        userType
  } 
}`;


export const programsQuery = `query ($criteria: ProgramCriteria!) {
  getPrograms(criteria: $criteria) {
    programs {
      program {
        id
        active
        name
        description
        coachName
        isPrivate
        genreId
        isParent
        parentProgramId
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

export const programCoachesQuery = `query ($programId: String!) {
  getProgramCoaches(programId: $programId) {
    peerCoaches {
      program {
        id
        active
        name
        description
        coachName
        isPrivate
        genreId
        isParent
        parentProgramId
      }
      coach {
        id
        email
        name
      }
    }
    error{
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

export const associateCoachQuery = `mutation ($input: AssociateCoachRequest!) {
  associateCoach(request: $input){
    program {
      id,
      name,
    }
    errors {
      field,
      message
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

export const managedEnrollmentQuery = `mutation ($input: ManagedEnrollmentRequest!) {
  managedEnrollment(managedEnrollmentRequest: $input) {
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
      enrollmentId,
      name,
      description,
      duration,
      scheduleStart,
      scheduleEnd,
      status,
      isClosed,
      sessionType,
      conferenceId,
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
        actualStart,
        actualEnd,
        status,
        isClosed,
        closingNotes,
        sessionType,
        conferenceId
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

export const planEventsQuery = `query ($criteria: EventCriteria!) {
  getPlanEvents(criteria: $criteria) {
    planRows {
      objective {
        id,
        scheduleStart,
        scheduleEnd,
        status,
        description
      },
      task{
        id,
        name,
        scheduleStart,
        scheduleEnd,
        duration,
        status,
        description
      },
      program {
        name,
        description,
        coachName
      },
    }
    error {
      message
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

export const enrollmentNotesQuery = `query ($criteria: PlanCriteria!) {
  getEnrollmentNotes(criteria: $criteria) {
    notes {
      session {
        name,
      }
      note {
        description,
        updatedAt,
      }
      by
    }
    error {
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

export const alterMemberTaskStateQuery = `mutation($input: ChangeMemberTaskStateRequest!) {
  alterMemberTaskState(request: $input) {
    task {
      id,
      name,
      enrollmentId,
      description,
      actorId,
      duration,
      min,
      max,
      scheduleStart,
      scheduleEnd,
      createdAt,
      actualStart,
      response,
      respondedDate,
      closingNotes,
      actualEnd,
      cancelledDate,
      status,
      canStart,
      canRespond,
      canFinish,
      canComplete,
      canCancel,
      canReopen
    }
    errors {
      field
      message
    }
  }
}`;

export const updateTaskResponseQuery = `mutation($input: UpdateResponseRequest!) {
  updateTaskResponse(request: $input) {
    task {
      id,
      name,
      enrollmentId,
      description,
      actorId,
      duration,
      min,
      max,
      scheduleStart,
      scheduleEnd,
      createdAt,
      actualStart,
      response,
      respondedDate,
      closingNotes,
      actualEnd,
      cancelledDate,
      status,
      canStart,
      canRespond,
      canFinish,
      canComplete,
      canCancel,
      canReopen
    }
    errors {
      field
      message
    }
  }
}`;

export const alterCoachTaskStateQuery = `mutation($input: ChangeCoachTaskStateRequest!) {
  alterCoachTaskState(request: $input) {
    task {
      id,
      name,
      enrollmentId,
      description,
      actorId,
      duration,
      min,
      max,
      scheduleStart,
      scheduleEnd,
      createdAt,
      actualStart,
      response,
      respondedDate,
      closingNotes,
      actualEnd,
      cancelledDate,
      status,
      canStart,
      canRespond,
      canFinish,
      canComplete,
      canCancel,
      canReopen
    }
    errors {
      field
      message
    }
  }
}`;

export const updateTaskClosingNotesQuery = `mutation($input: UpdateClosingNoteRequest!) {
  updateTaskClosingNotes(request: $input) {
    task {
      id,
      name,
      enrollmentId,
      description,
      actorId,
      duration,
      min,
      max,
      scheduleStart,
      scheduleEnd,
      createdAt,
      actualStart,
      response,
      respondedDate,
      closingNotes,
      actualEnd,
      cancelledDate,
      status,
      canStart,
      canRespond,
      canFinish,
      canComplete,
      canCancel,
      canReopen
    }
    errors {
      field
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
        actorId,
        duration,
        min,
        max,
        scheduleStart,
        scheduleEnd,
        createdAt,
        actualStart,
        response,
        respondedDate,
        closingNotes,
        actualEnd,
        cancelledDate,
        status,
        canStart,
        canRespond,
        canFinish,
        canComplete,
        canCancel,
        canReopen
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

export const updateObservationQuery = `mutation ($input: UpdateObservationRequest!) {
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

export const createAbstractTaskQuery = `mutation($input: NewAbstractTaskRequest!) {
  createAbstractTask(request: $input) {
    abstractTask {
    name
    }
    errors {
      field
      message
    }
  } 
}`;

export const abstractTasksQuery = `query ($criteria: AbstractTaskCriteria!) {
  getAbstractTasks(criteria:$criteria) {
    abstractTasks {
        name,
    }
  }
}`;

export const createMasterPlanQuery = `mutation($input: NewMasterPlanRequest!) {
  createMasterPlan(request: $input) {
    masterPlan {
      id,
      name,
      description
      coachId
    }
    errors {
      field
      message
    }
  }
}`;

export const updatePlanInfoQuery = `mutation($input: UpdatePlanInfoRequest!) {
  updatePlanInfo(request: $input) {
    masterPlan {
      id,
      name,
      description
      coachId
    }
    errors {
      field
      message
    }
  }
}`;

export const masterPlansQuery = `query ($criteria: MasterPlanCriteria!) {
  getMasterPlans(criteria:$criteria) {
    masterPlans {
      id,
      name,
      description
    }
  }
}`;

export const saveMasterPlanQuery = `mutation($input: UpdateMasterPlanRequset!) {
  saveMasterPlan(request: $input) {
    rows
    errors {
      field
      message
    }
  }
}`;

export const coachMembersQuery = `query ($criteria: CoachCriteria!) {
  getCoachMembers(criteria:$criteria) {
    members {
        enrollment {
        id,
        isNew,
        createdAt,
      }
      user {
        id,
        email,
        name
      }
      program {
        name,
        id,
        coachName,
        coachId
      }
    }
    error {
      message
    }
  }
}`;

export const getBoardsQuery = `query($criteria: EventCriteria!){
  getBoards(criteria : $criteria){
    boards{
      session{
        id,
        name,
        sessionType,
        conferenceId,
      },
      urls
    }
  }
}`;

export const findSessionQuery = `query ($criteria: SessionCriteria!) {
  getSession(criteria: $criteria) {
        id,
        name,
        duration,
        scheduleStart,
        scheduleEnd,
        actualStart,
        actualEnd,
        status,
        sessionType,
        conferenceId
  } 
}`;

export const getDiscussionsQuery = `query ($criteria: DiscussionCriteria!) {
  getDiscussions(criteria: $criteria) {
    discussions{
      id,
      description,
      createdById,
      createdAt
    }
    error{
      message
    }
  }
}`;

export const createDiscussionQuery = `mutation ($input: NewDiscussionRequest!) {
  createDiscussion(newDiscussionRequest:$input) {
    discussion{
      id,
      enrollmentId,
      description,
      createdById,
      createdAt
    }
    errors{
      message
    }
  }
}`;

export const getPendingDiscussionsQuery = `query ($criteria: UserCriteria!) {
  getPendingDiscussions(criteria: $criteria) {
    feeds{
      feed {
        id,
        createdAt,
        enrollmentId,
        programId,
        programName,
        coachId,
        coachName,
        memberId,
        memberName
      },
      description,
      user {
        id,
        name,
        email,
        userType
      }
    }
    error{
      message
    }
  }
}`;

export const createConferenceQuery = `mutation ($input: NewConferenceRequest!) {
  createConference(newConferenceRequest: $input){
    conference {
      id,
      name,
      description,
      programId,
      people,
      duration,
      scheduleStart,
      scheduleEnd,
    }
    errors {
      field,
      message
    }
  }
}`;

export const manageConferencePeopleQuery = `mutation ($input: MemberRequest!) {
  manageConference(memberRequest: $input){
    rows 
    errors {
      field,
      message
    }
  }
}`;