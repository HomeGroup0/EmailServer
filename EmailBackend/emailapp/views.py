from django.db import IntegrityError
from django.forms import ValidationError
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializers import EmailSerializer, FolderSerializer, UserSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Email, Folder, User


# User C.R.U.D
class UserAPI(APIView):
    @method_decorator(csrf_exempt)
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        existing_user = User.objects.filter(username=request.data.get('username'))
        # Validate that the username is not being updated to one that already exists.
        if existing_user.exists():
             return Response({'error': 'This username is already in use.'}, status=status.HTTP_400_BAD_REQUEST)      
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response({'error': 'This username is already in use.'}, status=status.HTTP_400_BAD_REQUEST)


class UserDetailsAPI(APIView):
    @csrf_exempt
    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        user = self.get_object(pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, pk):
        user = self.get_object(pk)
        serializer = UserSerializer(user, data=request.data)

        # Validate that the username is not being updated to one that already exists.
        if 'username' in request.data and User.objects.exclude(pk=pk).filter(
                username=request.data['username'].lower()).exists():
            return Response({'username': ['This username is already in use.']})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Email C.R.U.D
class EmailAPI(APIView):
    @method_decorator(csrf_exempt)
    def get(self, request):
        emails = Email.objects.all()
        serializer = EmailSerializer(emails, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailDetailsAPI(APIView):
    def get_object(self, pk):
        try:
            return Email.objects.get(pk=pk)
        except Email.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        email = self.get_object(pk)
        serializer = EmailSerializer(email)
        return Response(serializer.data)

    # def put(self, request, pk):
    #     email = self.get_object(pk)
    #     serializer = EmailSerializer(email, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        email = self.get_object(pk)
        email.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# List of emails received per user
class ByEmail_APIView(APIView):
    @csrf_exempt
    def get(self, request, format=None, *args, **kwargs):
        arg = kwargs
        try:
            post = Email.objects.filter(receiver=arg.get('email').lower())
            serializer = EmailSerializer(post, many=True)
            return Response(serializer.data)
        except Email.DoesNotExist:
            raise Http404


# List of emails sent by user
class bySend_APIView(APIView):
    @csrf_exempt
    def get(self, request, format=None, *args, **kwargs):
        arg = kwargs
        try:
            post = Email.objects.filter(sender=arg.get('email').lower())
            serializer = EmailSerializer(post, many=True)
            return Response(serializer.data)
        except Email.DoesNotExist:
            raise Http404


#List of emails by folder and user
#Comming soon!

# Folders C.R.U.D  Crazy rigth?!.
class Folders_APIView(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer
