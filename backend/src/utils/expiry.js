export const expireCertificate = async (certificate) => {
  if (
    certificate.status === "active" &&
    certificate.expiryDate &&
    certificate.expiryDate < new Date()
  ) {
    certificate.status = "expired";
    await certificate.save();
  }
};
