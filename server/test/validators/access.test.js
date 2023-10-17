import {
    grantAccessValidator,
    revokeAccessValidator,
    getAccessValidator,
} from '../../validators/access.js';
import { objectValidator, singleValidator } from '../../validators/basic_validators.js';
import { ValidationError } from '../../util/error.js';

describe('grantAccessValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { directoryId: 1, userId: 1, accessRight: 'view' } };
        const reply = {};
        const next = jest.fn();

        const value = { directoryId: 1, userId: 1, accessRight: 'view' };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        grantAccessValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { directoryId: '1', accessRight: 'view' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        grantAccessValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('revokeAccessValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { directoryId: 1, userId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = { directoryId: 1, userId: 1 };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        revokeAccessValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { directoryId: '1' } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        revokeAccessValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('getAccessValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { directoryId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = 1;
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        getAccessValidator(req, reply, next);

        expect(req.body.value).toEqual({ directoryId: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: {} };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        getAccessValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});