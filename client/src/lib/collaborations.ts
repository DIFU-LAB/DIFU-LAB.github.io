import source from "@content/team/collaborations.json";

export type CollaboratingGroup = {
  id: string;
  name: string;
  lead: string;
  institution: string;
  url: string;
};

export type AcademicCollaborator = {
  id: string;
  name: string;
  title: string;
  specialism: string;
  department: string;
  researchCentre?: string;
  institution: string;
  profileUrl: string;
};

export const collaboratingGroups = source.groups as CollaboratingGroup[];
export const academicCollaborators =
  source.collaborators as AcademicCollaborator[];
export const surreyCollaborators = academicCollaborators.filter(
  person => person.institution === "University of Surrey"
);
