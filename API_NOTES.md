# PMX API integration notes (sanitized)

Project code example: `prjCd=070120` (site-specific; should be configurable, not hard-coded globally).

## 1) Company list
GET `/cst/api/v1/at/codefind/prj-ptnco-lst`
Query observed: `ptncoWktpSctCd=&ptncoNm=&prjCd={prjCd}`
Purpose: fetch current project partner-company list. Use `ptncoCd` as stable key and `ptncoNm` as display name. Deduplicate by `ptncoCd` because the same company can appear for multiple work-type categories.

## 2) Worker search/list
GET `/cst/api/v1/at/attendanceuser/at-attdnwk-user-info-1-tel-sel`
Observed query fields: `prjCd, prjNm, attdnwkUserLnkgFrYmd, attdnwkUserLnkgToYmd, userName, ptncoCd, ptncoNm, hdofRtrmYn, moblRegYn, gsemp, userId, brdt, phone4digit, vhclNo, photo`.
Purpose: search workers, including by name and phone last 4 digits, and inspect current partner company / employment status.
Observed status mapping: `hdofRtrmYn="T"` => 재직, `"F"` => 퇴직.

## 3) Worker detail
GET `/cst/api/v1/at/attendanceuser/at-attdnwk-user-info-sel`
Observed query fields: `prjCd, attdnwkUserId, attdnwkUserLnkgId, hdofRtrmYn, isEditable`.
Purpose: fetch full worker detail before a safe update.

## 4) Worker update / company change
POST `/cst/api/v1/at/attendanceuser/at-attdnwk-user-info-cud`
Observed payload includes many worker fields. Key fields include: `modType="U"`, `attdnwkUserId`, `attdnwkUserLnkgId`, `prjCd`, `ptncoCd`, and the rest of the current worker detail.
Safety rule: fetch the current detail first, preserve fields, change only intended values such as `ptncoCd`, submit, then re-fetch to verify. Do not construct a partial payload until the server contract is confirmed.
Observed success shape: `successOrNot="Y"`, `statusCode="SUCCESS"`, `data.rtn="OK"`, `data.resultCode="0"`.

## 5) Employment-state update candidate
POST `/cst/api/v1/at/attendanceuser/at-attdnwk-user-f-info-cud`
Observed payload is an array with `prjCd`, `attdnwkUserLnkgId`, `lastWrtrId`.
Observed success shape: `successOrNot="Y"`, `statusCode="SUCCESS"`, `data.resultCode="0"`.
Note: Based on observed UI flow this appears related to 퇴직→재직 handling, but verify by re-querying `hdofRtrmYn` after the operation before treating it as definitive.

## 6) Health-check management lookup
GET `/cst/api/v1/at/attendanceuser/at-attdnwk-user-hlth-chkup-enfc-mgmt-pid-sel`
Query observed: `prjCd, wkrId`.
Purpose: health-management / checkup history lookup. Not required for company-change MVP but reusable later.

## Security / architecture
- Never embed PMX cookies, session IDs, Authorization headers, or user passwords in the public application.
- Public partner-company site only creates a change request.
- Approval + PMX API execution should run on the authorized manager's logged-in company PC/session.
- Before update, validate worker name + phone4 + current company + status; after update, re-query and confirm target state.
