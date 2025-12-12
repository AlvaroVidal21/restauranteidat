export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
    createdAt: Date;
}

export interface Comment {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    createdAt: Date;
}

export interface DatabaseSchema {
    users: User[];
    posts: Post[];
    comments: Comment[];
}