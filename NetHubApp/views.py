from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt,ensure_csrf_cookie
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse,Http404
from .utils import ExtendedEncoder,ConvertB64ToImage
from django.shortcuts import render,get_object_or_404
from django.urls import reverse
import datetime
import base64
from PIL import Image
import json
import os
from .models import User,Post,Comment,Follower,Bookmark

# Create your views here.


def home(request):
    return HttpResponseRedirect(reverse("index", args=('home',) ))

def index(request,page='home'):
    # Making sure that every user has a profile picture
    posts = Post.objects.all()
    page_name =page.replace('_',' ').upper()
    if request.user.is_authenticated:
        allowed_pages = ['home','bookmarks','following_posts']

        if page not in allowed_pages:
            raise Http404
        
        else:

            if not os.path.exists(request.user.profile_picture.path):
                request.user.profile_picture = 'user_images/default.png'
                request.user.save()
            custom_posts= None
            
            if page == 'following_posts':
            
                try:	
                    getuser=Follower.objects.get(user_follower=request.user)
                except Follower.DoesNotExist:
                    Follower.objects.create(user_follower=request.user)
                    getuser=Follower.objects.get(user_follower=request.user)
                getfollowing = getuser.following.all()

                custom_posts = Post.objects.filter(post_creator__in=getfollowing).order_by("-post_date").all()
            
            elif page == 'bookmarks':
                custom_posts = [b.post for b in Bookmark.objects.filter(user = request.user).order_by('-id')]


            
            return render(request, "NetHubApp/index.html",{
                "posts":posts.order_by("-post_date").all(),
                "custom_posts":custom_posts,
                "page":page_name,
                "follow":None
            
            })
            
    else:
        if page != 'home':
            return HttpResponseRedirect(reverse("index", args=('home',)))
        return render(request, "NetHubApp/index.html",{
            "posts": posts.order_by("-post_date").all(),
            "page":page_name,
        })

def UsersInfoPage(request,username,page):
    if request.user.is_authenticated:
        

        allowed_pages = ['following','followers','profile']
        page_name =page.replace('_',' ').upper()

        if page not in allowed_pages:
            raise Http404

        else:

            

            posts = Post.objects.all()
            
            try:
                getuser = User.objects.get(username = username)
                if not os.path.exists(getuser.profile_picture.path):
                    getuser.profile_picture = 'user_images/default.png'
                    getuser.save()
            except User.DoesNotExist:
                raise Http404('User does not Exist')

            try:	
                getfollow=Follower.objects.get(user_follower=getuser)
            except Follower.DoesNotExist:
                Follower.objects.create(user_follower=getuser) 
                getfollow = Follower.objects.get(user_follower = getuser)
            follow = None
            is_profile = False
            isAuthUser = request.user == getuser 
            authFollow = Follower.objects.get(user_follower= request.user)
            
            users_posts = Post.objects.filter(post_creator = getuser)
            if page == 'following':
                
                follow = getfollow.following.all()


            elif page == 'followers':
                follow = getuser.followers.all()


            elif page == 'profile':
                
                is_profile = True
                
            num_followers =  getuser.followers.all().count()
            num_following = getfollow.following.all().count()
            return render(request, "NetHubApp/index.html",{
                "page":page_name,
                "posts":posts.order_by("-post_date").all(),
                "users_posts":users_posts,
                "follow":follow,
                "profile_user":getuser,
                "is_profile":is_profile,
                "authFollow":authFollow,
                "isAuthUser":isAuthUser,
                "follow_obj":getfollow,
                "num_followers":num_followers,
                "num_following":num_following,

            })

    else:
        return HttpResponseRedirect(reverse("index", args=('home',) ))

def indexAjax(request,page):
    posts = Post.objects.all().order_by("-post_date").all()
    allowed_pages = ['home','bookmarks','following_posts','following','followers','profile']
    
    if page in allowed_pages:
        profpic_empty = False
        username = request.GET.get('username').strip().lower()
        try:
            getuser = User.objects.get(username = username)
            if not os.path.exists(getuser.profile_picture.path):
                getuser.profile_picture = 'user_images/default.png'
                getuser.save()
                profpic_empty = True
        except User.DoesNotExist:
            raise Http404('User Not Found')

        try:	
            getfollow=Follower.objects.get(user_follower=getuser)
        except Follower.DoesNotExist:
            Follower.objects.create(user_follower=getuser) 
            getfollow = Follower.objects.get(user_follower = getuser)
        follow = None
        follow_list=[]
        is_following = False
        authUser = request.user.username
        if page == 'bookmarks':
            posts = [b.post for b in Bookmark.objects.filter(user = request.user).order_by('-id')]
        

        elif page == 'following_posts':
            getfollow = Follower.objects.get(user_follower = request.user)
            getfollowing = getfollow.following.all()

            posts = Post.objects.filter(post_creator__in=getfollowing).order_by("-post_date").all()
        
        elif page == 'followers':
            follow = getuser.followers.all()
            follow_list = [f.user_follower.serialize() for f in follow]
            


        elif page == 'following':
            follow = getfollow.following.all()
            follow_list = [f.serialize() for f in follow]

        elif page == 'profile':
            posts = Post.objects.filter(post_creator=getuser).order_by("-post_date").all()
        num_followers =  getuser.followers.all().count()
        num_following = getfollow.following.all().count()
        
        return JsonResponse(
            {
                'posts':[post.serialize() for post in posts],
                'follow':follow_list,
                'is_following':is_following,
                'authUser':authUser,
                'user':getuser.serialize(),
                'numfollowers':num_followers,
                'numfollowing':num_following,
                'profpic_empty':profpic_empty
            },
                encoder=ExtendedEncoder
        )
    
    else:
        return  JsonResponse({'error':'error'})


def getUserInfo(request):
    try:
        username = request.GET.get('username').strip().lower()
        getUser = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error':'No user found'})

    return JsonResponse({'user':getUser.serialize()})

    
def create_post(request,):
    if request.method == "POST":
        post_creator_id = request.user.id
        post_content = request.POST["post_content"]
        post_image = request.FILES.get("post_image")
        post_user = User.objects.get(id=int(post_creator_id))
        Post.objects.create(post_creator = post_user, post_content=post_content, post_image=post_image)
        return HttpResponseRedirect(reverse("index", args=('home',) ))
    else:

        raise Http404('wrong url')

def edit_post(request,post_id):
    if request.method == "POST":
        post = get_object_or_404(Post,pk=post_id)
        # print(request.POST)
        post_content = request.POST.get('post_content')
        
        Post.objects.filter(id=post_id).update(post_content=post_content,Edited=True)
        return JsonResponse({'edited':True})
        
    else:
        raise Http404('wrong url')


def updateProfile(request,username):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax and request.method == 'PUT':

        # print(json.load(request))
        # print(request)
        data = json.load(request)
        fname = data.get('fname').strip()
        lname = data.get('lname').strip()
        new_username = data.get('username').strip().lower()
        about = data.get('bio')
        dob = data.get('dob')
        pics = data.get('pic')
        dataType = data.get('imageFile')
        
        _,imgFormat = os.path.splitext(dataType)
    
        valid_img_format = [".jpg",".jpeg",".png",".gif",".jfif",".JPG",".JPEG",".PNG",".GIF",".JFIF"]

        
        months = {
            'January':1,
            'February':2,
            'March':3,
            'April':4,
            'May':5,
            'June':6,
            'July':7,
            'August':8,
            'September':9,
            'October':10,
            'November':11,
            'December':12
            }
        if dob != "":
            convertStr = dob.replace(',','')
            formatDate = convertStr.split(' ')
            dob = datetime.date(int(formatDate[2]),months[formatDate[1]],int(formatDate[0]))
        
        else:
            dob = None
        try:
            getUser = User.objects.get(username = username)
        
            getUser.first_name = fname
            getUser.last_name = lname
            getUser.username = new_username
            getUser.about= about
            getUser.Date_of_Birth = dob
            getUser.save()


            if pics != None:
                if imgFormat not in valid_img_format:
                    return JsonResponse({'error':'invalid image format'})
                image_ex = pics.split(';')
                image_ex_2 = image_ex[1].split(',')[1]


                image_process = ConvertB64ToImage(image_ex_2,getUser)
                image_process.ProcessImage()

                

        except User.DoesNotExist:
            return JsonResponse({'error':'No such user'})

        getfollow=Follower.objects.get(user_follower=getUser)    
        num_followers =  getUser.followers.all().count()
        num_following = getfollow.following.all().count()
        users_posts = getUser.posts.all().order_by("-post_date").all()
        authUser = request.user.username
        return JsonResponse(
            {
                'user':getUser.serialize(),
                'users_posts':[post.serialize() for post in users_posts],
                'num_following':num_following,
                'num_followers':num_followers,
                'authUser':authUser
            }
        )


def handleFollow(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax and request.method == 'PUT':
        data = json.load(request)
        authUser = data.get('authUser').lower()
        affectedUser = data.get('affectedUser')
        follow_type = data.get('follow_type')
        follow = None
        try:
            getAuthUser = User.objects.get(username=authUser)
            getAffectedUser = User.objects.get(username= affectedUser)
        
        except User.DoesNotExist:
            return JsonResponse({'message':'error no user found'})

        getAuthFollow = Follower.objects.get(user_follower = getAuthUser)
        

        if follow_type == "follow":
            if getAffectedUser not in getAuthFollow.following.all():
                getAuthFollow.following.add(getAffectedUser)
                follow = True
    
        elif follow_type == "unfollow":
            if getAffectedUser in getAuthFollow.following.all():
                getAuthFollow.following.remove(getAffectedUser)
                follow = False

        follow_count = getAffectedUser.followers.all().count()

        return JsonResponse({'message':'successful','follow':follow, 'follow_count':follow_count})




def BookmarkPost(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == 'PUT':

        data = json.load(request)
        user = data.get('username')
        postId = data.get('postId')
        status = data.get('status')
        try:
            getUser= User.objects.get(username= user)
            getPost = Post.objects.get(id=postId)
        except User.DoesNotExist:
            return JsonResponse({'error':'No User With the Username'})
        except Post.DoesNotExist:
            return JsonResponse({'error':'Post Not Found, It may have been deleted'})
        
        qs = Bookmark.objects.filter(user=getUser,post=getPost)
        if status  == 'add':
            if not qs.exists():
                Bookmark.objects.create(user=getUser,post=getPost)
                message = 'Bookmarked Successfully'

        else:
            
            if qs.exists():
                qs.delete()
                message = 'Removed from Bookmark successfully'

        getUser.save()
        return JsonResponse({'message':message})
        

def handleLike(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    if is_ajax and request.method == 'PUT':
        data = json.load(request)
        post_id = data.get('postId')
        status = data.get('status')

        try:
            getPost = Post.objects.get(id = int(post_id))
        except Post.DoesNotExist:
            return JsonResponse({'error':'No post of such id'})

        if status == 'like':
            print(getPost.liked_by.all(), request.user)
            if request.user not in getPost.liked_by.all():
                getPost.liked_by.add(request.user)
                getPost.post_likes +=1
                getPost.save()
                message = 'liked successfully'

        elif status == 'unlike':
            if request.user in getPost.liked_by.all() and getPost.post_likes > 0:
                getPost.liked_by.remove(request.user)
                getPost.post_likes -= 1
                getPost.save()
                message = 'unliked successfully'

        return JsonResponse({'message':message, 'likes':getPost.post_likes})



def login_view(request):    
    if request.method == "POST": 
    	# Attempt to sign user in
        username = request.POST["username-login"].strip().lower()
        password = request.POST["password-login"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index", args=('home',)))
        else:
            return render(request, "NetHubApp/authForm.html", {
                "message": "Invalid username and/or password.",
                "form":"SIGN IN"
            })
    else:
    	if request.user.is_authenticated:
    		return HttpResponseRedirect(reverse("index", args=('home',)))
    	else:
        	return render(request, "NetHubApp/authForm.html",{
                "form":"SIGN IN"
            })


def register(request):
    if request.method == "POST":
        username = request.POST["username"].strip().lower()
        email = request.POST["email"].strip()
        first_name = request.POST["fname"].strip()
        last_name = request.POST["lname"].strip()

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
		
        if password != confirmation:
            return render(request, "NetHubApp/authForm.html", {
                "message": "Passwords must match.",
                "form":"SIGN UP"
            })

        # Attempt to create new user
		
        else:
            try:
                user = User.objects.create_user(username, email, password, first_name=first_name,last_name=last_name)
                user.save()
                Follower.objects.create(user_follower=user)
                login(request, user)
                return HttpResponseRedirect(reverse("index", args=('home',)))
            except IntegrityError:
                return render(request, "NetHubApp/authForm.html", {

                    "message": "Username already taken.",
                    "form":"SIGN UP"

                })

	
    else:
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse("index", args=('home',)))
        else:
            return render(request, "NetHubApp/authForm.html",{"form":"SIGN UP"})



def logout_view(request):
    if request.method =='POST':
        logout(request)
        return HttpResponseRedirect(reverse("index", args=('home',)))