import type {
  Testimonial,
  BlogCategory,
  CourseCategory,
  About,
  Spotlight,
  Blog,
  Curriculum,
  CreateInstructorForm,
  CreateStudentForm,
} from "@/types";

const testimonialInitial: Testimonial = {
  student: "",
  description: "",
};

const blogCategoryInitial: BlogCategory = {
  name: "",
  slug: "",
};

const courseCategoryInitial: CourseCategory = {
  name: "",
  slug: "",
  image: "",
};

const aboutInitial: About = {
  title: "",
  description: "",
  image: "",
  status: "active",
};

const spotlightInitial: Spotlight = {
  title: "",
  description: "",
  image: "",
  status: "active",
};

const blogInitial: Blog = {
  title: "",
  slug: "",
  description: "",
  image: "",
  categories: [],
  tags: [],
  status: "published",
  content: "",
};

const instructorInitial: CreateInstructorForm = {
  firstName: "",
  lastName: "",
  email: "",
  bio: "",
  image: "",
  password: "",
  confirmPassword: "",
};

const studentInitial: CreateStudentForm = {
  firstName: "",
  lastName: "",
  email: "",
  image: "",
  phone: "",
  gender: "" as null,
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

const curriculumInitial: Curriculum[] = [
  {
    title: "",
    lessons: [{ title: "", duration: "", video_url: "" }],
  },
];

const overviewInitial: string[] = [""];

export {
  blogInitial,
  spotlightInitial,
  aboutInitial,
  courseCategoryInitial,
  blogCategoryInitial,
  testimonialInitial,
  curriculumInitial,
  overviewInitial,
  instructorInitial,
  studentInitial,
};
