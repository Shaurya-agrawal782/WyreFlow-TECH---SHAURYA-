/**
 * Email template for candidate creation notification
 */
const candidateCreatedTemplate = ({ name, email }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #333;">Application Received</h2>
    <p>Dear ${name},</p>
    <p>Thank you for submitting your application to our recruitment platform.</p>
    <p>We have successfully received your details (registered email: <strong>${email}</strong>) and our hiring team will review them shortly.</p>
    <p>Best regards,<br/>Recruitment Team</p>
  </div>
`;

/**
 * Email template for candidate status updates
 */
const candidateStatusUpdatedTemplate = ({ name, status }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
    <h2 style="color: #333;">Application Status Update</h2>
    <p>Dear ${name},</p>
    <p>Your application status has been updated to: <strong style="color: #007bff; text-transform: uppercase;">${status}</strong>.</p>
    <p>We will contact you if there are next steps in the recruitment process.</p>
    <p>Best regards,<br/>Recruitment Team</p>
  </div>
`;

/**
 * Email template for CSV import completion summaries
 */
const csvImportSummaryTemplate = ({ totalRows, successCount, failedCount, failedRows }) => {
  const failureRowsHtml = failedRows && failedRows.length > 0 
    ? `<h3>Failed Rows Details:</h3>
       <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; border-color: #ddd;">
         <tr style="background-color: #f2f2f2;">
           <th align="left">Row</th>
           <th align="left">Reason</th>
         </tr>
         ${failedRows.map(f => `
           <tr>
             <td>${f.row}</td>
             <td>${f.reason}</td>
           </tr>
         `).join('')}
       </table>`
    : '<p style="color: green;">All candidate rows were imported successfully with no failures.</p>';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #333;">CSV Import Summary Report</h2>
      <p>The candidate CSV import process has completed. Here is the summary report:</p>
      <ul>
        <li><strong>Total Rows Processed:</strong> ${totalRows}</li>
        <li><strong>Successfully Imported:</strong> <span style="color: green; font-weight: bold;">${successCount}</span></li>
        <li><strong>Failed Rows:</strong> <span style="color: red; font-weight: bold;">${failedCount}</span></li>
      </ul>
      ${failureRowsHtml}
      <br/>
      <p>Best regards,<br/>Recruitment Platform System</p>
    </div>
  `;
};

module.exports = {
  candidateCreatedTemplate,
  candidateStatusUpdatedTemplate,
  csvImportSummaryTemplate
};
