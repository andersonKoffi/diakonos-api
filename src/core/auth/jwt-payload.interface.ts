export interface JwtPayload {
  /** id de l'utilisateur */
  sub: string;
  email: string;
  /** église (tenant) active pour cette session */
  tenantId: string;
  roles: string[];
}
