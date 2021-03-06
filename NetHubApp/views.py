from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt,ensure_csrf_cookie
from django.db import IntegrityError
from django.db.models import F,Q
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse,Http404
from .utils import ExtendedEncoder,ConvertB64ToImage
from django.shortcuts import render,get_object_or_404
from django.urls import reverse
import datetime
import base64
from PIL import Image
import json
import os
from .models import User,Post,Comment,Follower,Bookmark,Search

# Create your views here.


def home(request):
    return HttpResponseRedirect(reverse("index", args=('home',) ))

def index(request,page='home'):
    # Making sure that every user has a profile picture
    posts = Post.objects.all()
    page_name =page.replace('_',' ').upper()
    if request.user.is_authenticated:
        allowed_pages = ['home','bookmarks','following_posts','discussion','search']

        if page not in allowed_pages:
            raise Http404
        
        else:


            if not os.path.exists(request.user.profile_picture.path):
                request.user.profile_picture = 'user_images/default.png'
                request.user.save()
            custom_posts= None
            discussion = None
            queryResult = None
            queryType = None
            search= False
 
            discussionPage = False
            
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

            elif page == 'discussion':
                discussionPage = True
                discussion = {
                    'user':request.session['currentUser'],
                    'post':request.session['postId'] 
                }
            
            elif page == 'search':
                search= True
                query = request.GET.get('query')
                queryType = request.GET.get('type')

                if queryType is not None and query is not None:
                    checkQuery = Search.objects.filter(query__iexact = query,search_user= request.user)
                    
                    if not checkQuery.exists() and len(query.strip()) > 0:

                        Search.objects.create(query= query, search_user = request.user)

                    if queryType == 'users':
                        queryResult = User.objects.filter(Q(username__icontains = query)|Q(first_name__icontains= query)|Q(last_name__icontains= query))
                    elif queryType == 'posts':
                        queryResult = Post.objects.filter(post_content__icontains = query)
                    else:

                        raise Http404
                

            
            users_list = []
            for u in User.objects.all():
                user_dict = {'user':u,'post_count':u.posts.all().count() }
                users_list.append(user_dict)
            
            top_users_list = sorted(users_list, key = lambda x :x['post_count'], reverse=True)[:5]
          
            return render(request, "NetHubApp/index.html",{
                "posts":posts.order_by("-post_date").all(),
                "custom_posts":custom_posts,
                "page":page_name,
                "follow":None,
                "discussion":discussion,
                "discussionPage":discussionPage,
                "users_lists":top_users_list,
                "queryResult":queryResult,
                "queryType":queryType,
                "search":search,
              

            })
            
    else:
        if page != 'home':
            return HttpResponseRedirect(reverse("index", args=('home',)))
        return render(request, "NetHubApp/index.html",{
            "posts": posts.order_by("-post_date").all(),
            "page":page_name,
        })

@login_required 
def discussionPage(request,username,postId):
    try:
        post = Post.objects.get(id = int(postId))
        user = User.objects.get(username = username.lower().strip())
        if post and user:
            request.session['currentUser'] = user.username
            request.session['postId'] = post.id
            return HttpResponseRedirect(reverse('index', args=('discussion',)))
    except:
        raise Http404('page not found')

@login_required
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

            users_list = []
            for u in User.objects.all():
                user_dict = {'user':u,'post_count':u.posts.all().count() }
                users_list.append(user_dict)
            
            top_users_list = sorted(users_list, key = lambda x :x['post_count'], reverse=True)[:5]
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
                "users_lists":top_users_list

            })

    else:
        return HttpResponseRedirect(reverse("index", args=('home',) ))
@login_required
def indexAjax(request,page):
    posts = Post.objects.all().order_by("-post_date").all()
    allowed_pages = ['home','bookmarks','following_posts','following','followers','profile','search']
    
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
        authUser = request.user
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
                'authUser':authUser.serialize(),
                'user':getuser.serialize(),
                'numfollowers':num_followers,
                'numfollowing':num_following,
                'profpic_empty':profpic_empty
            },
                encoder=ExtendedEncoder
        )
    
    else:
        return  JsonResponse({'error':'error'})


def querySearch(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == 'GET':
        data = request.GET
        query = data.get('query')
        queryType = data.get('type')
        submitted = data.get('submitted')

        if query is not None and queryType is not None:
            if submitted:
                checkQuery = Search.objects.filter(query__iexact = query,search_user= request.user)
                print(len(query.strip()),query.strip())
                if not checkQuery.exists() and len(query.strip()) > 0:

                    Search.objects.create(query= query, search_user = request.user)


            if queryType == 'posts':
                queryResult = Post.objects.filter(post_content__icontains = query)

            elif queryType == 'users':
                queryResult = User.objects.filter(Q(username__icontains = query)|Q(first_name__icontains= query)|Q(last_name__icontains= query))
            else:
                queryResult = []

        
            serializedResult = [result.serialize() for result in queryResult] 
            return JsonResponse({'result':serializedResult,'num_match':len(serializedResult),'authUser':request.user.serialize() })
        else:
            return JsonResponse({'error':'Request must have query and query type parameter' })

            
def recentSearch(request):

    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == 'GET':
        search_obj = Search.objects.filter(search_user= request.user)
        search_contents = [obj.query for obj in search_obj]
        return JsonResponse({'recentSearch':search_contents})
    
    if is_ajax and request.method == 'DELETE':
        Search.objects.filter(search_user =request.user).delete()

        if not Search.objects.filter(search_user =request.user).exists():
            return JsonResponse({'message':'Deleted succesfully'})


@login_required
def getUserInfo(request):
    try:
        username = request.GET.get('username').strip().lower()
        getUser = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error':'No user found'})

    return JsonResponse({'user':getUser.serialize()})

@login_required  
def create_post(request,):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        data = json.load(request)
        post_creator_id = request.user.id
        post_content = data.get("post_content")
        post_image = data.get("post_image")
        post_user = User.objects.get(id=int(post_creator_id))
        post_info = Post.objects.create(post_creator = post_user, post_content=post_content, post_image=post_image)
       
        return JsonResponse({
            'message':'post created successfully',
            'postInfo':post_info.serialize(),
            'postUser':post_user.serialize()
        })
    else:

        return JsonResponse({'message':'An error occured.. wrong request'})
@login_required
def edit_post(request,post_id):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == "POST":
        post = get_object_or_404(Post,pk=post_id)
        data = json.load(request)
        post_content =data.get('post_content')
        # post_content = request.POST.get('post_content')
        Post.objects.filter(id=post_id).update(post_content=post_content,Edited=True)
        return JsonResponse({'edited':True})
        
    else:
        raise Http404('wrong url')

@login_required
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
            
        print(dob)
        
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
        authUser = request.user.serialize()
        return JsonResponse(
            {
                'user':getUser.serialize(),
                'users_posts':[post.serialize() for post in users_posts],
                'num_following':num_following,
                'num_followers':num_followers,
                'authUser':authUser
            }
        )

@login_required
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



@login_required
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
        
@login_required
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
           
            if request.user not in getPost.liked_by.all():
                getPost.liked_by.add(request.user)
                getPost.post_likes = F('post_likes') + 1
                getPost.save()
                getPost.refresh_from_db()
                message = 'liked successfully'

        elif status == 'unlike':
            if request.user in getPost.liked_by.all() and getPost.post_likes > 0:
                getPost.liked_by.remove(request.user)
                getPost.post_likes = F('post_likes') - 1
                getPost.save()
                getPost.refresh_from_db()
                message = 'unliked successfully'
        
        getPost =  Post.objects.get(id = getPost.id)

        return JsonResponse({'message':message, 'likes':getPost.post_likes,'posts':getPost.serialize()})

@login_required
def handleComments(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == 'PUT':
        data = json.load(request)     
        post_id = data.get('postId')
        comment_message = data.get('message')
        try:
            getPost = Post.objects.get(id= int(post_id))
        except Post.DoesNotExist:
            return JsonResponse({'error':'No post of such id'})

        comment= Comment.objects.create(comment_user =request.user,comment_content=comment_message )

        getPost.post_comment.add(comment)

        return JsonResponse({'message':'comment made successfully', 'commentNum':getPost.post_comment.all().count()})

        
@login_required
def comment_page(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax and request.method == 'POST':
        data =json.load(request)
        post_id = data.get('postId')
        try:
            getPost = Post.objects.get(id= int(post_id))
        except  Post.DoesNotExist:
            return JsonResponse({'error':'an error occured'})
     

        return JsonResponse({'postInfo':getPost.serialize(),'user':request.user.serialize()})


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
        if first_name == '' or last_name == '':
            return None
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