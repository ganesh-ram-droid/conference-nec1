# TODO for AssignReviewer.jsx and adminController.js Updates

## Information Gathered
- AssignReviewer.jsx has two main sections: "All Reviewer Assignments" (displays papers with existing assignments) and "Assign Reviewer to Paper" (displays papers available for assignment with 0-1 reviewers).
- adminController.js provides getAllAssignments (for assigned papers) and getPapersAvailableForAssignment (for unassigned papers).
- Current state includes assignments (array of papers with reviewers) and availablePapers (array of papers with 0-1 reviewers).

## Plan
### front/src/AssignReviewer.jsx
- Add state variables: showAssigned (boolean), showUnassigned (boolean), currentPageAssigned (number), currentPageUnassigned (number), itemsPerPage (number).
- Add checkboxes above the tables: "Assigned paper (2 reviewers must)" and "Unassigned papers (0 or 1 reviewer)".
- Conditionally render tables based on checkbox states.
- For unassigned papers table, add color differentiation: red background for 0 reviewers, yellow for 1 reviewer.
- Add pagination components below each table: numbered links (1,2,3,4...) with prev/next buttons.
- In the assignments table, when editing, set the dropdown value to the current reviewer instead of "Select Reviewer".
- Update table rendering to use pagination slices.

### backend/controllers/adminController.js
- No major changes needed, as existing endpoints already support the required data. Minor adjustments if pagination params are added.

## Dependent Files to be edited
- front/src/AssignReviewer.jsx (major updates)
- backend/controllers/adminController.js (minor, if needed for pagination)

## Followup steps
- Test checkbox filtering functionality.
- Verify pagination works correctly for both tables.
- Check color differentiation in unassigned papers table.
- Ensure dropdown shows current reviewer in edit mode.
- Test assignment updates and deletions.
