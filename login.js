//To Fetch Login User Details
/*
Input Parameters : username
Output Parameters :[UserId, Username, Full Name,Default Org Id,Email Address,Session Id]
*/
async function LoginUserDetails(username) {
  return `SELECT DISTINCT usr.user_id, USR.USER_NAME, ppf.full_name, LISTAGG(DISTINCT nvl((SELECT profile_option_value FROM fnd_profile_option_values WHERE profile_option_id = (SELECT profile_option_id FROM fnd_profile_options WHERE profile_option_name = 'DEFAULT_ORG_ID') AND level_value_application_id = faa.application_id AND level_value = rtl.responsibility_id), NULL), ',') WITHIN GROUP (ORDER BY usr.user_id) default_org_id, usr.email_address, (SELECT session_id FROM xxmb_session_log WHERE login_status = 'Y' AND user_id = usr.user_id AND ROWNUM = 1) session_id FROM fnd_responsibility r, fnd_responsibility_vl rtl, apps.fnd_application faa, apps.fnd_user_resp_groups fug, apps.fnd_user usr, hr.per_all_people_f ppf WHERE 1 = 1 AND rtl.responsibility_id = r.responsibility_id AND faa.application_id (+) = r.application_id AND fug.responsibility_id = r.responsibility_id AND usr.user_id = fug.user_id AND ppf.person_id = usr.employee_id AND ppf.effective_end_date > sysdate AND r.end_date IS NULL AND rtl.end_date IS NULL AND rtl.end_date IS NULL AND rtl.version = 'M' AND usr.user_id = (SELECT user_id FROM fnd_user WHERE upper(user_name) = upper('${username}')) GROUP BY usr.user_id, USR.USER_NAME, ppf.full_name, usr.email_address`;
}

/* 
Get User Id of logged in user
Input parameters: username
Output parameters:[user_id]
*/
async function GetUserId(username) {
  return `select user_id from fnd_user where UPPER(USER_NAME)= UPPER('${username}') AND (END_DATE IS NULL or END_DATE >= SYSDATE)`;
}

/*
Check whether the user has login existing in the system
Input: userid
Output: login_status,session_id OLD_SESSION_ID  
*/
async function IsUserLoginExists(userid) {
  return `select login_status,session_id OLD_SESSION_ID from XXMB_SESSION_LOG where user_id = ${userid} AND LOGIN_STATUS = 'Y'`;
}

/*
Check is User has Session Exists in the database
Input: sessionid
Output:[login_status]
*/
async function IsSessionsExists(sessionid) {
  return `select login_status from XXMB_SESSION_LOG where session_id=${sessionid}`;
}

/**
 * Archive Old Login session
 * Input: sessionid
 * Output:
 */
async function ArchiveUserOldLogin(sessionid) {
  return `BEGIN INSERT INTO XXMB_SESSION_LOG_A (select l.*,'Y' from XXMB_SESSION_LOG l where session_id = ${sessionid}); COMMIT; END;`;
}

/**
 * Create a new session with the specified
 * Input parameter: userid, username
 * Output parmeter:[session_id,
        user_id,
        user_name,
        login_status,
        creation_date,
        last_update_date]
 */
async function CreateNewUserSession(userid, username) {
  return `BEGIN INSERT INTO XXMB_SESSION_LOG (session_id, user_id, user_name, login_status, creation_date, last_update_date) VALUES ( round(dbms_random.value(100000,999999999)),${userid}, upper('${username}'), 'Y', SYSDATE, SYSDATE); COMMIT; END;`;
}

/**Added On 14-10-23 12.50 AM */
async function DeleteArchiveSession(sessionid) {
  return `BEGIN DELETE from XXMB_SESSION_LOG where session_id = ${sessionid}; COMMIT; END;`;
}

const Login = {
  LoginUserDetails,
  GetUserId,
  IsUserLoginExists,
  IsSessionsExists,
  ArchiveUserOldLogin,
  CreateNewUserSession,
  DeleteArchiveSession,
};

module.exports = Login;
