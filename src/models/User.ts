import { Observer } from './Topic';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export class User implements Observer {
  private subscriptions: string[] = []; // List of topic IDs the user is subscribed to

  constructor(
    public id: string,
    public name: string,
    public email: string,
    public avatar?: string
  ) {}

  update(topic: string, postTitle: string): void {
    // In a real app, this would show a notification or update UI
    console.log(`Hello ${this.name}, there is a new post in ${topic}: "${postTitle}"`);
  }

  // Method to check if user is subscribed to a topic
  isSubscribed(topicId: string): boolean {
    return this.subscriptions.includes(topicId);
  }

  // Method to add a subscription
  addSubscription(topicId: string): void {
    if (!this.isSubscribed(topicId)) {
      this.subscriptions.push(topicId);
    }
  }

  // Method to remove a subscription
  removeSubscription(topicId: string): void {
    const index = this.subscriptions.indexOf(topicId);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
    }
  }

  // Method to get all subscriptions
  getSubscriptions(): string[] {
    return [...this.subscriptions];
  }
}

// Factory function to create a User instance from UserData
export function createUser(userData: UserData): User {
  return new User(
    userData.id,
    userData.name,
    userData.email,
    userData.avatar
  );
} 