export const getPatientWelcomeEmail = (patientFirstName: string, staffName: string) => {
  return `Hello, ${patientFirstName}

${staffName} wishes for you to provide information about yourself and to review some important documents.
Please, follow this link to log in to your secure Luna Health application, where you can also schedule appointments, pay online, and access video calls.

Best regards,
${staffName}`;
};
