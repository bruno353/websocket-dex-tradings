import { Controller, Get, Post, Param, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private users = []; // Should ideally use a service for this

  @Get()
  getAllUsers() {
    return this.users; // No checks for empty users array
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    const user = this.users.find((user) => user.id == id);
    return user;
  }

  @Post()
  createUser(@Body() body: any) {
    const newUser = {
      id: this.users.length + 1,
      name: body.name,
      email: body.email,
    };
    this.users.push(newUser);
    return newUser;
  }
}
