import Joi from 'joi';
import { updateUserDataValidator, idValidator, emailValidator } from '../../validators/user.js';
import { objectValidator, singleValidator } from '../../validators/basic_validators.js';
import { ValidationError } from '../../util/error.js';

describe('updateUserDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { id: 1, email: 'test@example.com', password: 'password', name: 'John Doe' } };
        const reply = {};
        const next = jest.fn();

        const value = { id: 1, email: 'test@example.com', password: 'password', name: 'John Doe' };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        updateUserDataValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { id: '1', email: 'test@example.com', password: 'pas', name: 'John Doe' } };
        const reply = {};
        const next = jest.fn();


        updateUserDataValidator(req, reply, next);

        const error = new ValidationError()
        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('idValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { user: { id: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = {
            id: 1
        };
        idValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { user: { id: 'A' } };
        const reply = {};
        const next = jest.fn();

        const error = new Error('Validation error');
        idValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('emailValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { email: 'test@example.com' } };
        const reply = {};
        const next = jest.fn();

        const value = 'test@example.com';
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        emailValidator(req, reply, next);

        expect(req.body.value).toEqual({
            email: value
        });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: { email: 'test' } };
        const reply = {};
        const next = jest.fn();

        const error = new Error('Validation error');
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        emailValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});