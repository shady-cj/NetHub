from django.db import models
from PIL import Image
import datetime 
from django.utils import timezone
# Create your models here.
import os 
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	profile_picture = models.ImageField(upload_to = "user_images/upload",default="user_images/default.png")
	Date_of_Birth = models.DateField(null=True,blank=True)
	about = models.TextField(null=True,blank=True)
	
	def fullName(self):
		return self.first_name + " "+ self.last_name
	def check_dob(self):
		if self.Date_of_Birth is not None:
			return self.Date_of_Birth.strftime("%d %B, %Y")
		else:
			return 'Not Provided'
	def __str__(self):
		return f"{self.username}"
	
	def get_bookmark(self):
		return [b.post.id for b in self.user_bookmark.all()]
	def serialize(self):

		return {
			'username':self.username.capitalize(),
			'pic':self.profile_picture.url,
			'id':self.id,
			'dob':self.check_dob(),
			'about':self.about,
			'bookmarks':[b.post.id for b in self.user_bookmark.all()],
			'firstName':self.first_name,
			'lastName':self.last_name,
			'fullName':self.first_name + " "+ self.last_name,
			'followers':[f.user_follower.username for f in self.followers.all()],
			'following':[follow.username for follow in self.user_following.all().first().following.all()],
			'posts':[post.serialize() for post in self.posts.all()]

		}



	# def save(self,*args,**kwargs):
	# 	if not os.path.exists(self.profile_picture.path):
	# 		self.profile_picture = 'user_images/default.png'
			
	# 	super().save(*args,**kwargs)


class Bookmark(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_bookmark')
	post =models.ForeignKey("Post", on_delete=models.CASCADE, related_name='bookmark_post')

class Follower(models.Model):
	user_follower = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user_following')
	following = models.ManyToManyField(User,blank=True,related_name="followers")

class Comment(models.Model):
	comment_user = models.ForeignKey(User,on_delete=models.CASCADE)
	comment_content = models.TextField()
	comment_date = models.DateTimeField(auto_now_add=True)
	def verbose_time_plural(self,num):
		if num > 1:
			return 's'
		else:
			return ''


	def time_format(self):
		now = datetime.datetime.now(datetime.timezone.utc)
		timestamp =self.comment_date
		time_difference = now - timestamp
		if time_difference.days < 1:
			hours = time_difference.seconds * 0.000277778 
			minutes = time_difference.seconds * 0.01666668
			seconds = time_difference.seconds

			if hours >= 1:

				return f'{round(hours)} hour{self.verbose_time_plural(round(hours))} ago'

			elif minutes < 60 and minutes >= 1 :
				return f'{round(minutes)} minute{self.verbose_time_plural(round(minutes))} ago'

			elif seconds == 0:
				return 'Now'

			else:
				return f'{round(seconds)} second{self.verbose_time_plural(round(seconds))} ago'

		else:
			return self.comment_date.strftime("%d %b, %Y")


	# def serialize(self):
	# 	return {
	# 		'id':self.id,
	# 		'comment_user':[user.serialize() for user in self.comment_user.all()],
	# 		'content':self.comment_content,
	# 		'comment_date':self.time_format()
	# 	}
class Post(models.Model):
	post_creator = models.ForeignKey(User,on_delete=models.CASCADE,related_name="posts" )
	post_content = models.TextField()
	post_image = models.ImageField(upload_to="post_images/%Y/%m/%d",blank=True,null=True)
	post_date = models.DateTimeField(auto_now_add=True)
	post_likes = models.IntegerField(default=0)
	liked_by = models.ManyToManyField(User,blank=True,related_name= "likes")
	post_comment = models.ManyToManyField(Comment,blank=True, related_name="commented_post")
	Edited = models.BooleanField(default=False)
	

	def verbose_time_plural(self,num):
		if num > 1:
			return 's'
		else:
			return ''


	def time_format(self):
		now = datetime.datetime.now(datetime.timezone.utc)
		timestamp =self.post_date
		time_difference = now - timestamp
		if time_difference.days < 1:
			hours = time_difference.seconds * 0.000277778 
			minutes = time_difference.seconds * 0.01666668
			seconds = time_difference.seconds

			if hours >= 1:

				return f'{round(hours)} hour{self.verbose_time_plural(round(hours))} ago'

			elif minutes < 60 and minutes >= 1 :
				return f'{round(minutes)} minute{self.verbose_time_plural(round(minutes))} ago'

			elif seconds == 0:
				return 'Now'

			else:
				return f'{round(seconds)} second{self.verbose_time_plural(round(seconds))} ago'

		else:
			return self.post_date.strftime("%d %b, %Y")


		

	def serialize(self):
		return {
			'id':self.id,
			'post_creator_id':self.post_creator.id,
			'post_creator_pic':self.post_creator.profile_picture.url,
			'post_creator_username':self.post_creator.username.capitalize(),
			'post_content':self.post_content,
			# 'post_image': self.post_image.url,
			'post_date':self.time_format(),
			'post_full_date':self.post_date.strftime(" %I:%M %p · %b %d, %Y"),
			'post_likes':self.post_likes,
			'liked_by':[{'userId':user.id, 'username':user.username,'userPic':user.profile_picture.url } for user in self.liked_by.all() ],
			'post_comment_info':[
				{'id':comment.id,'comment_content':comment.comment_content, 'comment_date':comment.time_format(),'comment_user_info':{'userCommentId':comment.comment_user.id,'userCommentPic':comment.comment_user.profile_picture.url,'userCommentUsername':comment.comment_user.username.capitalize()}} for comment in self.post_comment.all()
			],
			'post_comment_number':self.post_comment.all().count(),
			'edited':self.Edited

		}


class Search(models.Model):
	query = models.CharField(max_length = 64,blank= True)
	search_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = 'search_queries')
	
	class Meta:
		
		verbose_name_plural = 'Searches'

