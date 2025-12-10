const maidController = require('../controllers/maidController');
const User = require('../models/User');

// Mock User model
jest.mock('../models/User');

describe('Maid Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: 'user123' },
            body: {},
            files: []
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('should update maid profile skills and experience', async () => {
            const mockUser = {
                _id: 'user123',
                save: jest.fn(),
                maidProfile: {}
            };
            User.findById.mockResolvedValue(mockUser);

            req.body = {
                experience: 5,
                skills: ['Cleaning', 'Cooking']
            };

            await maidController.updateProfile(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockUser.maidProfile.experience).toBe(5);
            expect(mockUser.maidProfile.skills).toEqual(['Cleaning', 'Cooking']);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Profile updated successfully'
            }));
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);
            await maidController.updateProfile(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('uploadDocuments', () => {
        it('should upload documents and set status to pending', async () => {
            const mockUser = {
                _id: 'user123',
                save: jest.fn(),
                maidProfile: {
                    documents: [],
                    verificationStatus: 'unverified'
                }
            };
            User.findById.mockResolvedValue(mockUser);

            req.files = [
                { path: 'uploads/doc1.jpg', originalname: 'doc1.jpg' }
            ];
            req.body = { docType: 'NID' };

            await maidController.uploadDocuments(req, res, next);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockUser.maidProfile.documents).toHaveLength(1);
            expect(mockUser.maidProfile.documents[0].url).toBe('uploads/doc1.jpg');
            expect(mockUser.maidProfile.documents[0].status).toBe('pending');
            expect(mockUser.maidProfile.verificationStatus).toBe('pending');
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if no files uploaded', async () => {
            await maidController.uploadDocuments(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
