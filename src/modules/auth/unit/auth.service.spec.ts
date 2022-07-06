import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../database/user/user.entity/user.entity';
import { Types } from 'mongoose';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../../database/user/user.entity/user.repository';
import { userRepositoryMock } from './mocks/user-repository.mock';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtServiceMock } from './mocks/jwt-service.mock';

describe('AuthService', () => {
  let module: TestingModule;
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockJwtService: jest.Mocked<JwtService>;
  let createUserDto: CreateUserDto;
  let USER: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mockUserRepository = module.get(UserRepository);
    mockJwtService = module.get(JwtService);

    createUserDto = {
      fullName: 'john Doe',
      email: 'john@mail.com',
      password: '123456',
    };

    USER = new User();
    USER._id = new Types.ObjectId('62c4829030d3e530dd779e70');
    USER.fullName = 'John Doe';
    USER.email = 'john@mail.com';
    USER.password = '123456';
    USER.valiadatePassword = jest.fn();
  });

  afterEach(async () => {
    await module.close();
  });

  test('services should be defined', () => {
    expect(authService).toBeDefined();
    expect(mockUserRepository).toBeDefined();
    expect(mockJwtService).toBeDefined();
  });

  describe('Register user', () => {
    it('should throw "Email already taken" error message when email already taken', async () => {
      let errorMessage: string;
      try {
        mockUserRepository.findOne.mockResolvedValue(USER);
        await authService.register(createUserDto);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toBe('Email already taken');
    });
  });

  describe('Login user', () => {
    it('should throw "Password or email is incorrect" error message when entered not registered email', async () => {
      let errorMessage: string;
      try {
        mockUserRepository.findOne.mockResolvedValue(null);
        await authService.login(createUserDto);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toBe('Password or email is incorrect');
    });

    it('should throw "Password or email is incorrect" error message when entered not validated password and email combination', async () => {
      let errorMessage: string;
      try {
        USER.valiadatePassword.mockReturnValue(false);
        mockUserRepository.findOne.mockResolvedValue(USER);
        await authService.login(createUserDto);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).toBe('Password or email is incorrect');
    });
  });
});
